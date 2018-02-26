insert into Volunteers (UserID, ServiceID)
select {0}, max(ServiceID)
from Services
where ServiceName = '{1}'
