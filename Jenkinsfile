@Library("Shared") _
pipeline{
    agent { label "ai-carrer-coach"}
    stages{
        stage("code"){
           steps{
               script{
                echo "cloning from github "
                git_clone("https://github.com/robinvatshr08/AI-Career-Coach.git", "main")
                echo "code clone succefully  from github"
            }
          }
        }
       
        stage("build"){
            steps{
                script{
                    docker_build("ai-career-coach","latest","robinvats")
                }
             echo "docker image build successfully"
            }
        }
        stage("test"){
            steps{
             echo "this is testing stage"
            }
        }
        stage("Push to DockerHub"){
            steps{
             echo "Application pushing to DockerHub"
             script{
                 docker_push("ai-career-coach","latest","robinvats")
             }
             echo "Docker image pushed successfully ."
        }
        }
        stage("deploy"){
            steps{
             echo "this is deploying stage"
            
             sh "docker compose up -d "
             echo "Deployment completed successfully."
            }
        }
         
    }
}
