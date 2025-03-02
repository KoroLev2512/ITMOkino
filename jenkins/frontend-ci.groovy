pipeline {
    agent none
    stages {
        stage('Checkout') {
            steps {
                git branch: '${branch}',
                    credentialsId: 'github',
                    url: 'git@github.com:KoroLev2512/ITMO-kino.git'
            }
        }
        stage('Setup frontend dev server') {
            steps {
                sh 'test message'
            }
        }
    }
}
