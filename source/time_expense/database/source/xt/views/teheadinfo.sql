select xt.create_view('xt.teheadinfo', $$

select tehead.*,
  xt.te_total_hours(tehead_id) as total_hours,
  xt.te_total_expenses(tehead_id) as total_expenses,
  xt.te_to_voucher(tehead_id) as to_voucher,
  xt.te_to_invoice(tehead_id) as to_invoice,
  xt.te_invoiced_state(tehead_id) as invoiced,
  xt.te_vouchered_state(tehead_id) as vouchered,
  xt.te_posted_state(tehead_id) as posted,
  xt.te_invoiced_value(tehead_id) as invoiced_value,
  xt.te_vouchered_value(tehead_id) as vouchered_value,
  xt.te_posted_value(tehead_id) as posted_value,
  basecurrid() as curr_id
from te.tehead;

$$, false);


create or replace rule "_INSERT" as on insert to xt.teheadinfo do instead

insert into te.tehead (
  tehead_id,
  tehead_number,
  tehead_weekending,
  tehead_lastupdated,
  tehead_notes,
  tehead_status,
  tehead_emp_id,
  tehead_warehous_id,
  tehead_username
) values (
  coalesce(new.tehead_id, nextval('te.timesheet_seq'::regclass)),
  new.tehead_number,
  new.tehead_weekending,
  coalesce(new.tehead_lastupdated, now()),
  new.tehead_notes,
  coalesce(new.tehead_status, 'O'),
  new.tehead_emp_id,
  new.tehead_warehous_id,
  coalesce(new.tehead_username, geteffectivextuser())
);

create or replace rule "_UPDATE" as on update to xt.teheadinfo do instead

update te.tehead set
  tehead_number = new.tehead_number,
  tehead_weekending = new.tehead_weekending,
  tehead_lastupdated = new.tehead_lastupdated,
  tehead_notes = new.tehead_notes,
  tehead_status = new.tehead_status,
  tehead_emp_id = new.tehead_emp_id,
  tehead_warehous_id = new.tehead_warehous_id,
  tehead_username = new.tehead_username
where tehead_id = old.tehead_id;

create or replace rule "_DELETE" as on delete to xt.teheadinfo do instead

delete from te.tehead where tehead_id=old.tehead_id;
