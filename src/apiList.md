# DevConncet APIs

## authRouter
-POST /signup
-POST /login
-POST /logout

## profileRouter
-GET /profile/view
-PATCH /profile/edit
-PATCH /profile/password

## conncetionRequestRouter
-POST /request/send/intrested/:userId
-POST /request/send/ignored/:userId
-POST /request/review/accepted/:requestId
-POST /request/review/rejected/:requestId

## userRouter
-GET /user/conncetions
-GET /user/requests/received
-GET /user/feed       -gets profile of other users
