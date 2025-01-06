# New Idea Abstract

When a user submits a request to create a playground, it’ll hit my main backend (running on my laptop).
My laptop will add the details to a messaging queue. Then, my secondary PC (on the same Wi-Fi)
will pick up the message and spin up the required Docker containers using a Docker Compose file
which will have two services:

1. The first service will handle what the user needs (e.g., coding in Next.js, Go, Rust, etc.).
2. The second service will act as a bridge between the user’s browser and the first service, syncing changes in
   real time via WebSocket.

Once the containers are up, they’ll send back the allocated ports to the main server,
which will pass them on to the user’s browser. The browser will then connect to the services,
and then, the playground will be ready.

# Working of the docker containers and playground servers

The playground server machines will be connected to a WebSocket or will be
listening to a message queue. The message received will have a structure like this
{
playground_name: String,
service_name: String,
}

Whenever a new message is received on a particular machine. A bash script or a block of code
will start running which will do the following

1. Create a new docker volume for that particular task named the playground_name
2. Clone the github repo specified folder into Downloads folder with name of playground_name.
3. Start the docker compose file by passing the name of docker volume as argument
4. Fetch the new service ids and names and return to main user

# Communication With Main Backend And Playground Host Machines (Not Containers Inside Host)

We will be using a messaging queue to handle the messaging part. We can use Rabbit MQ preferably.
The main backend does will be connected to this messaging queue with apis. ie We do not
require a seperate server on the Main server machine to send messages. We will be sending messages
from our express server.

All the playground host machines will be running a server inside them. This server will
consumer messages from producers. And do the neccessary tasks as mentioned in prev step.
We will be using a load balancing techniques to handle load b/w these playground host machines.
Also one message will be consumed by only one machine.

In case of scenarios like the machine acknowledged the message and then after some time an error occured like
it failed to allocate the docker volmume. Then our consumers cant send messages to producer. So to
prevent this we can enable custom message acknowledgement.
