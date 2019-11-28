# thingy-api

A RESTful Thingy-API for project of group AES2019-yellow

- [thingy-api](#thingy-api)
  - [Sprint 1](#sprint-1)
    - [Setting-up Thingy and Thingy-gateway (done)](#setting-up-thingy-and-thingy-gateway-done)
    - [MQTT Client and subscribe with event listener (done)](#mqtt-client-and-subscribe-with-event-listener-done)
    - [WS implemented with MVC (done)](#ws-implemented-with-mvc-done)
    - [API Endpoints and Routers (in processing)](#api-endpoints-and-routers-in-processing)
    - [Resources: (`GET` only)](#resources-get-only)
    - [Integrate Swagger UI for the implemented 4 APIs (Done)](#integrate-swagger-ui-for-the-implemented-4-apis-done)
    - [Checklist](#checklist)
      - [Setting-up Thingy and Thingy-gateway (done)](#setting-up-thingy-and-thingy-gateway-done)
      - [MQTT Client and subscribe with event listener (done)](#mqtt-client-and-subscribe-with-event-listener-done)
      - [WS implemented with MVC (done)](#ws-implemented-with-mvc-done)
      - [Model with redis (done)](#model-with-redis-done)
      - [API Endpoints and Routers (done)](#api-endpoints-and-routers-done)
      - [Integrate Swagger UI for the implemented 4 APIs (Done)](#integrate-swagger-ui-for-the-implemented-4-apis-done)
      - [Web Client (scaffolding) with data representation (Done)](#web-client-scaffolding-with-data-representation-done)
      - [Models for historical data with RDMBS (Done)](#models-for-historical-data-with-rdmbs-done)
      - [Using ORM (Sequelize) to decouple the DB and Model (Done)](#using-orm-sequelize-to-decouple-the-db-and-model-done)
      - [Using Redis Sub / Pub to verify the amount of appended fields. Hence, data can be compressed (in mean values) and transfered to a RDBMS (Done)](#using-redis-sub--pub-to-verify-the-amount-of-appended-fields-hence-data-can-be-compressed-in-mean-values-and-transfered-to-a-rdbms-done)
    - [Endpoint / Resources: (`GET` only)](#endpoint--resources-get-only)



## Sprint 1

### Checklist

#### Setting-up Thingy and Thingy-gateway (done)

#### MQTT Client and subscribe with event listener (done)

#### WS implemented with MVC (done)

#### Model with redis (done)

#### API Endpoints and Routers (done)

#### Integrate Swagger UI for the implemented 4 APIs (Done)

#### Web Client (scaffolding) with data representation (Done)

#### Models for historical data with RDMBS (Done)

#### Using ORM (Sequelize) to decouple the DB and Model (Done)

#### Using Redis Sub / Pub to verify the amount of appended fields. Hence, data can be compressed (in mean values) and transfered to a RDBMS (Done)

### Endpoint / Resources: (`GET` only)

|no.|resources|verb|url|comment|
|--|--|--|--|--|
|1|temperature|`GET`|`/temperature/?last={n}`|Returns last `n` data of temperature in an array|
|2|Air quality|`GET`|`/airquality/?last={n}`|Returns last `n` data of CO2 and TVOC in an array|
|3|Pressure|`GET`|`/pressure/?last={n}`|Returns last `n` data of pressure in an array|
|4|Humidity|`GET`|`/humidity/?last={n}`|Returns last `n` data of humidity in an array|

> If no query or if last > 999, the APIs above return only 10 records as default.
> `n` refers to the acquired number (rows).

## Sprint 2 (in discussion)

### Create User Profile

```js
// User schema:
{
    firstName : String,
    lastName: String,
    email: String
    username: String
    password: password,
}
```

### Create User authentication based on JWT

Some methods: (might be)

- Before Login:
  - register
  - login

- After Login:
  - profile (updateUser)
  - all other APIs

### Documentation on Swagger

Loading the file __thingy-api-yellow.yaml__ in the [swagger editor](https://editor.swagger.io/)

#### JWT Token usage

All after login-in APIs needs to add `Bearer <Token>` in `Header.` 
example of source code for a request with authentication 

```
GET /devices/ HTTP/1.1
Host: 127.0.0.1:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTU3NDM0MjE3MCwiZXhwIjoxNTc0MzYzNzcwfQ.CwWG7JlnuojH7nj7oWl51oTGxsvi7SmCmSFqd-y_8bc
User-Agent: PostmanRuntime/7.17.1
Accept: */*
Cache-Control: no-cache
Postman-Token: d30a23f4-d06b-4067-b569-0ce6ce53a325,e8dba0ad-c38d-43ec-8706-7f5344fb533f
Host: 127.0.0.1:3000
Accept-Encoding: gzip, deflate
Connection: keep-alive
cache-control: no-cache
```

then got result:

```JSON
{
    "devices": [
        "fe:1f:a1:94:c8:20"
    ],
    "size": 1
}
```

Without authentication or with invalid authentication
the `ctx.status` is 401. and a message is returned:

```
Authentication Error
```

#### User Activation

Now User can be activted by the activation link returned from register:

```
{
"user": 
	{
	"username": "testuser1",	
	"firstname": "John",
	"lastname": "Doe",
	"email": "test1@test.com",
	"password": "1@2B3c",
	"repeat_password": "1@2B3c"
	}
}
```

response:

```
{
    "user": {
        "id": 12,
        "username": "testuser",
        "firstname": "John",
        "lastname": "Doe",
        "email": "test@test.com"
    },
    "activation": "http://127.0.0.1:3000/activation/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxMiwidXNlcm5hbWUiOiJ0ZXN0dXNlcjEiLCJmaXJzdG5hbWUiOiJKb2huIiwibGFzdG5hbWUiOiJEb2UiLCJlbWFpbCI6InRlc3QxQHRlc3QuY29tIn0sImlhdCI6MTU3NDgxMTg2MH0.ENrcHtPz2o8_ooI7FWx-x_2zzZNpKM2645ek3eNQtN8",
    "status": "saved"
}
```

if user visite the GET /activation/<token> with valid token, a message with an status of activated will be returned.

```
{
    "user": {
        "id": 11,
        "username": "testuser",
        "firstname": "John",
        "lastname": "Doe",
        "email": "test@test.com",
        "isActivated": true,
        "createdAt": "2019-11-26T23:42:58.400Z",
        "updatedAt": "2019-11-26T23:43:06.374Z"
    },
    "status": "activated"
}
```

without activation, if user login with correct email and password, an error message will be notified and an reActivation link is also generated:
(without activation)
```
{
"user": 
	{
	"email": "test@test.com",
	"password": "1@2B3c"
	}
}
```

response:

```
{
    "error": "User is not activated",
    "reActivation": "http://127.0.0.1:3000/activation/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxMiwidXNlcm5hbWUiOiJ0ZXN0dXNlcjEiLCJmaXJzdG5hbWUiOiJKb2huIiwibGFzdG5hbWUiOiJEb2UiLCJlbWFpbCI6InRlc3QxQHRlc3QuY29tIn0sImlhdCI6MTU3NDgxMTg3NH0.IQc0bVjRiw0QtNOYtR0ru5zZQjEua7EcMeMTRxFZA9s",
    "status": "error"
}
```

### Location Based Service API (LBS API added) 

> Authentication required

Example 

```
http://127.0.0.1:3000/lbs/?last=5
```

result

```
{
    "positions": [
        {
            "Lat": "46.79461",
            "Long": "7.15395",
            "timestamp": "2019-11-27T18:36:57.262Z"
        },
        {
            "Lat": "46.79461",
            "Long": "7.15395",
            "timestamp": "2019-11-27T18:36:56.265Z"
        },
        {
            "Lat": "46.79461",
            "Long": "7.15395",
            "timestamp": "2019-11-27T18:36:55.233Z"
        },
        {
            "Lat": "46.79455",
            "Long": "7.1539",
            "timestamp": "2019-11-27T18:36:29.251Z"
        },
        {
            "Lat": "46.79455",
            "Long": "7.1539",
            "timestamp": "2019-11-27T18:36:28.224Z"
        }
    ],
    "speeds": [
        {
            "speed": "0",
            "timestamp": "2019-11-27T18:36:57.412Z"
        },
        {
            "speed": "0",
            "timestamp": "2019-11-27T18:36:56.588Z"
        },
        {
            "speed": "0",
            "timestamp": "2019-11-27T18:36:55.274Z"
        },
        {
            "speed": "0.15",
            "timestamp": "2019-11-27T18:36:29.435Z"
        },
        {
            "speed": "0",
            "timestamp": "2019-11-27T18:36:28.264Z"
        }
    ]
}
```
