# Running the Application

## Run app

```sh
node server.js
```

## Run app as dev

```sh
npm run devstart
```

## Build and run container

```bash
docker build -t cards-backend .
docker run --name cards-backend -p 5000:5000 cards-backend
```
