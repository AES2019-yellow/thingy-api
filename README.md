# thingy-api

A RESTful Thingy-API for project of group AES2019-yellow

- [thingy-api](#thingy-api)
  - [Sprint 1](#sprint-1)
    - [Setting-up Thingy and Thingy-gateway (done)](#setting-up-thingy-and-thingy-gateway-done)
    - [MQTT Client and subscribe with event listener (done)](#mqtt-client-and-subscribe-with-event-listener-done)
    - [WS implemented with MVC (done)](#ws-implemented-with-mvc-done)
    - [API Endpoints and Routers (in processing)](#api-endpoints-and-routers-in-processing)
    - [Resources: (`GET` only)](#resources-get-only)
  - [Sprint 2 (in discussion)](#sprint-2-in-discussion)
    - [Create User Profile](#create-user-profile)
    - [Create User authentication based on JWT](#create-user-authentication-based-on-jwt)


## Sprint 1

### Setting-up Thingy and Thingy-gateway (done)

### MQTT Client and subscribe with event listener (done)

### WS implemented with MVC (done)

### Model with redis (done)

### API Endpoints and Routers (in processing)

### Resources: (`GET` only)

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
    gender: Int,
    age: Int
    email: String
    username: String
    password: password,
    token: // for oAuth not for jwt
}
```

### Create User authentication based on JWT

Some methods: (might be)

- Before Login:
  - createUser
  - login

- After Login:
  - updateUser
  - acquireToken
  - renewToken
  - dismissToken
  - deleteUser (only for admin) ?
