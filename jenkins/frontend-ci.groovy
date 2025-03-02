pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
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
