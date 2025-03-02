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
        stage('Check current state') {
            steps {
                sh 'pwd'
            }
        }
        stage('Setup frontend dev server') {
            steps {
                sh 'npm install'
                sh 'npm run build'
                sh 'pm2 start npm --name "dev-server" -- run dev'
            }
        }
    }
}
