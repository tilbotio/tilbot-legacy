# Tilbot.io: democratizing conversational agent development and research

To run:
1. Check out code
2. Install required node packages: npm install
3. Install MongoDB (I am using 5.0.7 on OS X)
4. Start the server: node index.js
5. Browse to localhost:8080/edit/ to start building!

(Dashboard, account management, and sharing links to chatbot projects still under development)

Default profile icon by https://www.freepik.com/pch-vector

***

## Using Docker
If you want to use the docker-compose version of this project, you will need to create the .env file in the root directory that contains:

    MONGO_HOST=db
    MONGO_PORT=27017
    MONGO_INITDB_DATABASE=tilbot
    MONGO_INITDB_ROOT_USERNAME=root
    MONGO_INITDB_ROOT_PASSWORD=root
    MONGO_DATABASE_USERNAME=user
    MONGO_DATABASE_PASSWORD=pass

## Using HTTPS
If you want to use HTTPS:
1. Put your .pem and .pem in a directory called 'certs' under the project root folder

With Docker:
2. Set USE_HTTPS to 1 in the docker-compose.yaml file
3. Make sure the ports are set correctly in the docker-compose.yaml file (TILBOT_PORT environment and the ports under 'node' service)

Without Docker:
2. Set the use_https variable to true in index.js
3. Make sure the port is set correctly in index.js (defaults to 443)