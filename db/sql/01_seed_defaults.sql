insert into settings(key,value) values
(''outreach.daily_limit'',               ''{"value":100}''),
(''discovery.max_ready_cities_ahead'',   ''{"value":3}''),
(''email.auto_send_after_QA'',           ''{"enabled":true}''),
(''deploy.require_human_approval'',      ''{"enabled":true}''),
(''stripe.mode'',                        ''{"test":true}''),
(''escalation.email_only'',              ''{"enabled":true}''),
(''followups.cadence_days'',             ''{"touches":[3,7,14]}'')
on conflict (key) do update set value=excluded.value, updated_at=now();

insert into pricing_addons(code,description,hours_estimate,price,active) values
(''blog_ai'',''Blog setup with AI integration'',15,375,true),
(''cms_pages'',''Extra CMS pages (per 5 pages)'',6,150,true),
(''booking'',''Booking / calendar integration'',6,150,true),
(''ecom_basic'',''Simple store (≤25 SKUs)'',24,600,true),
(''ecom_pro'',''Store (≤250 SKUs, variants, tax/shipping)'',48,1200,true),
(''logo_refresh'',''Logo tidy-up + brand sheet'',3,75,true),
(''copy_basic'',''Copy polish (up to 5 pages)'',6,150,true),
(''photo_pack'',''Stock photo curation/licensing'',3,75,true),
(''seo_local'',''Local SEO pack (schema/GBP/reviews)'',8,200,true),
(''speed_plus'',''Advanced performance tuning'',8,200,true),
(''a11y_plus'',''Accessibility pass (WCAG AA)'',8,200,true)
on conflict (code) do nothing;
