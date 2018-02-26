select
      UserID
    , FirstName
    , LastName
    , Email
    , Password
    , IsAdmin
from Users
where Email = '{0}'
