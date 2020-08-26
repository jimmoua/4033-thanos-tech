pipeline {
  agent any
  tools {nodejs "Node"}
  stages {
    stage("Install modules") {
      steps {
        sh "rm -rf node_modules"
        sh "npm install"
      }
    }
  }
}
