# Implementing AMQP for processing purchase orders 

![Architecture](./img/image.png)

```
│
├── img/
│
├── order-service/
│   ├── models/
│   │   └── Order.js
│   ├── node_modules/
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
│
├── order-worker/
│   ├── models/
│   │   └── Order.js
│   ├── node_modules/
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   └── worker.js
│
├── docker-compose.yml
│
└── README.md

```

Read the Blog here for further details: 