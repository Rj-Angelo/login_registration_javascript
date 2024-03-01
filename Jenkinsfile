void setBuildStatus(String message, String state) {
  step([
      $class: "GitHubCommitStatusSetter",
      reposSource: [$class: "ManuallyEnteredRepositorySource", url: "https://github.com/erickzkie027/login_registration_javascript.git"],
      contextSource: [$class: "ManuallyEnteredCommitContextSource", context: "ci/jenkins/build-status"],
      errorHandlers: [[$class: "ChangingBuildStatusErrorHandler", result: "UNSTABLE"]],
      statusResultSource: [ $class: "ConditionalStatusResultSource", results: [[$class: "AnyBuildResult", message: message, state: state]] ]
  ]);
} 

applicationIPAddress= "3.0.181.1"
sourceBranch = ghprbSourceBranch
targetBranch = ghprbTargetBranch

pipeline {
    agent any
    //tools { nodejs "NodeJS" }
    
    stages {
        stage('Deploy Sample Instance') {
            steps {
                script {
                    Integer port = 3000
                    String directory = "/var/www/login_app"
                    String staging_env = "staging_env"

                    echo "port is ${port}"
                    echo "directory is ${directory}"
                    echo "staging_env is ${staging_env}"
                  

                    withCredentials([sshUserPrivateKey(credentialsId: "sshadmin", keyFileVariable: 'SSH_KEY')]) {
                        def remote = [
                            name: 'ubuntu',
                            port: 22,
                            allowAnyHosts: true,
                            host: "${applicationIPAddress}",
                            user: "ubuntu",
                            identityFile: SSH_KEY
                        ]

                        echo "Fetch branch and checkout to change branch"
                        sshCommand remote: remote, command: "cd ${directory} && sudo git fetch"
                        sshCommand remote: remote, command: "cd ${directory} && sudo git checkout ${sourceBranch}"
                        sshCommand remote: remote, command: "cd ${directory} && sudo git pull origin ${sourceBranch}"

                        withCredentials([file(credentialsId: staging_env, variable: 'yaml_file')]) {
                            sh 'mv \$yaml_file ./configs'
                            sshPut remote: remote, from: "./configs/sample.env.yml", into: "/var/www/tmp_server_files/"
                        }

                        sshCommand remote: remote, command: "sudo rm -rf ${directory}/configs/sample.env.yml"
                        sshCommand remote: remote, command: "sudo mv /var/www/tmp_server_files/sample.env.yml ${directory}/configs/"
                    }

                    echo currentBuild.result
                }
            }
        }
    } 
}
