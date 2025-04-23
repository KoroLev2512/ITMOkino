# Документация

## Содержание
- [Виртуальные машины](#виртуальные-машины)
- [Манифесты](#манифесты)
-   [`namespace.yaml`](#-namespaceyaml)
-   [`secret.yaml`](#-secretyaml)
-   [`postgres-deployment.yaml`](#-postgres-deploymentyaml)
-   [`cinema-app.yaml`](#-cinema-appyaml)
- [Основные команды](#основные-команды)

## Виртуальные машины
Существует 2 виртуальных машины (в дальнейшем ВМ), к которым есть доступ. 1-ая ВМ находится вне кластера. Через неё происходит управление кластером через утилиту `kubectl`, она связана с кластером в `yandex cloud`. Вторая ВМ - единственный рабочий (воркер) узел кластера (на мастер ноде (`control plane`) никакие сущности не работают). 
Все сущности разбиваются на 2 пространства имён (`namespace`): `cinema` и `cinema-monitoring`. В `cinema` работает приложение, в `cinema-monitoring` - мониторинг. Для того, чтобы увидеть сущности того или иного пространства имён, необходимо указать его название через ключ `-n`. К примеру, для получения списка всех сущностей `K8S` в пространстве имён `cinema` используется следующая команда: `kubectl get all -n cinema`.


## Манифесты

Все находятся по путь `/home/efim/itmokino-app/k8s`

### `namespace.yaml`
Создаёт изолированное пространство `cinema` в Kubernetes кластере. Все объекты (Pods, Services, Secrets и т.д.) будут размещены внутри этого namespace.

#### Манифест

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: cinema
```

---

### 🔐 `secret.yaml`
Секрет, содержащий чувствительные переменные окружения для приложения и базы данных:
- `POSTGRES_USER`, `POSTGRES_PASSWORD` — учётные данные PostgreSQL
- `JWT_SECRET` — ключ для генерации JWT токенов

#### Манифест

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: cinema-secret
  namespace: cinema
type: Opaque
stringData:
  POSTGRES_USER: admin
  POSTGRES_PASSWORD: admin
  JWT_SECRET: cinema-app-secret-jwt-key-2025
```


---

### 🐘 `postgres-deployment.yaml`
Разворачивает PostgreSQL с использованием PVC для хранения данных. Использует секреты `cinema-secret` для конфигурации пользователя и пароля.

#### Компоненты
- **PVC**: 1Gi том для хранения данных PostgreSQL
- **Deployment**: 1 реплика PostgreSQL
- **Service**: TCP:5432 доступ для других компонентов

#### Манифест

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: cinema
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: cinema
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:latest
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              value: cinema
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: cinema-secret
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: cinema-secret
                  key: POSTGRES_PASSWORD
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: cinema
spec:
  selector:
    app: postgres
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
```


---

### 🎬 `cinema-app.yaml`
Веб-приложение с автоматическим масштабированием по CPU. Подключается к PostgreSQL, использует переменные из секрета.

#### Компоненты
- **Deployment**: 2 реплики приложения
- **Service**: LoadBalancer на порт 80
- **HPA**: масштабирование от 2 до 5 подов по метрике CPU (15%)

#### Манифест

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cinema-app
  namespace: cinema
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cinema-app
  template:
    metadata:
      labels:
        app: cinema-app
    spec:
      containers:
        - name: cinema-app
          image: docker.io/efiml/app:latest
          ports:
            - containerPort: 3000
          resources:
            requests:
              cpu: "100m"
            limits:
              cpu: "500m"
          env:
            - name: DATABASE_URL
              value: postgresql://admin:admin@postgres:5432/cinema
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: cinema-secret
                  key: JWT_SECRET
---
apiVersion: v1
kind: Service
metadata:
  name: cinema-app
  namespace: cinema
spec:
  selector:
    app: cinema-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cinema-app-hpa
  namespace: cinema
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cinema-app
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 15
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 30
```

---

### 📈 `load-test.yaml`
Контейнер, генерирующий постоянную нагрузку на сервис `cinema-app` через `wget` в цикле. Используется для тестирования масштабирования (HPA).

#### Манифест

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: load-generator
  namespace: cinema
spec:
  containers:
    - name: busybox
      image: busybox
      command: ["sh", "-c", "while true; do wget -q -O- http://cinema-app:80; done"]
```

## Основные команды
Получить все сущности в пространстве имён `cinema`
```sh
kubectl get all -n cinema
```

Получить все поды в пространстве имён `cinema`
```sh
kubectl get pods -n cinema
```

Получить hpa в пространстве имён `cinema`
```sh
kubectl get hpa -n cinema
```

### Запуск тестовой нагрузки
```sh
kubectl apply -f load-test.yaml
```

Отслеживание автоскейлинга
```sh
kubectl describe hpa cinema-app-hpa -n cinema
```

Удаление пода нагрузки
```sh
kubectl delete pod load-generator -n cinema
```
