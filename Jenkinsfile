pipeline {
    agent any

    stages {

        stage('Welcome') {
            steps {
                echo 'Welcome to CyberAI CI/CD Pipeline!'
            }
        }

        stage('Checkout') {
            steps {
                echo 'Repository connected successfully.'
            }
        }

        stage('Build') {
            steps {
                sh 'echo Building CyberAI...'
            }
        }

        stage('Test') {
            steps {
                sh 'echo Running tests...'
                sh 'node -v'
                sh 'npm -v'
                sh 'node test.js'
            }
        }
    }

    post {

        always {
            echo 'Pipeline Finished.'
        }

        success {
            echo 'Build Successful!'
        }

        failure {
            echo 'Build Failed!'
        }
    }
}