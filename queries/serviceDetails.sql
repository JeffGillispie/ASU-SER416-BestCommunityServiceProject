select
  ServiceID,
  ServiceName,
  ServiceType,
  ServiceDescription,
  ServicePrice,
  ServiceFee,
  (ServicePrice + ServiceFee) as TotalPrice
from Services
where ServiceID = {0}
