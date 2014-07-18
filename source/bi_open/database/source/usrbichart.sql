select xt.create_table('usrbichart', 'bi_open');

select xt.add_column('usrbichart','usrbichart_id', 'serial', 'primary key', 'bi_open');
select xt.add_column('usrbichart','usrbichart_usr_username', 'text', '', 'bi_open');
select xt.add_column('usrbichart','usrbichart_chart', 'text', '', 'bi_open');
select xt.add_column('usrbichart','usrbichart_ext_name', 'text', '', 'bi_open');
select xt.add_column('usrbichart','usrbichart_filter_option', 'text', '', 'bi_open');
select xt.add_column('usrbichart','usrbichart_groupby_option', 'text', '', 'bi_open');
select xt.add_column('usrbichart','usrbichart_measure', 'text', '', 'bi_open');
select xt.add_column('usrbichart','usrbichart_charttype', 'text', '', 'bi_open');
select xt.add_column('usrbichart','usrbichart_dimension', 'text', '', 'bi_open');
select xt.add_column('usrbichart','usrbichart_order', 'integer', '', 'bi_open');
select xt.add_column('usrbichart','usrbichart_uuid_filter', 'text', '', 'bi_open');

comment on table bi_open.usrbichart is 'Charts users have selected for dashboard';
