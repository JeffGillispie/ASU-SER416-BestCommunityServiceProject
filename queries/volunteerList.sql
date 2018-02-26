select
	u.UserID,
	u.FirstName,
	u.LastName,
	u.Email
from Users u
	inner join Volunteers v on v.UserID = u.UserID
group by u.UserID, u.FirstName, u.LastName, u.Email
