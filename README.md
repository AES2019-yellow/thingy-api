# thingy-api
A RESTful Thingy-API for project of group AES2019-yellow

## Routers


Resources:

Get  only 

all last n (in 1 MINUTE) records

Temperature

Air quality

Humidity

Pressure

Locations

/GET /{resource}/?res={n} 
n refers to the acquired number (rows).



Sprint 2

User
schema:

{
    first name : String,
    last name: String,
    gender: 0/1
    age:
    email:
    username:
    password:
    token: // for oAuth not for jwt
}

Create

Update

login
get token

Delete (only for admin)

/