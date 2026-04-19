create table public.categories (
  id uuid not null default gen_random_uuid (),
  name character varying(100) not null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint categories_pkey primary key (id),
  constraint categories_name_key unique (name)
) TABLESPACE pg_default;

create table public.customers (
  id character varying(10) not null,
  name character varying(255) not null,
  email character varying(255) null,
  phone character varying(50) null,
  total_spent numeric(12, 2) null default 0,
  total_orders integer null default 0,
  join_date date null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint customers_pkey primary key (id),
  constraint customers_email_key unique (email)
) TABLESPACE pg_default;

create table public.daily_sales (
  id integer generated always as identity not null,
  date character varying(20) null,
  sales integer null,
  revenue numeric(12, 2) null,
  constraint daily_sales_pkey primary key (id)
) TABLESPACE pg_default;

create table public.dashboard_stats (
  id integer generated always as identity not null,
  total_sales integer null,
  revenue numeric(12, 2) null,
  total_products integer null,
  total_customers integer null,
  sales_change numeric(5, 2) null,
  revenue_change numeric(5, 2) null,
  products_change integer null,
  customers_change numeric(5, 2) null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint dashboard_stats_pkey primary key (id)
) TABLESPACE pg_default;

create table public.product_performance (
  id integer generated always as identity not null,
  product_name character varying(255) null,
  sales integer null,
  revenue numeric(12, 2) null,
  constraint product_performance_pkey primary key (id)
) TABLESPACE pg_default;

create table public.products (
  id character varying(10) not null,
  name character varying(255) not null,
  price numeric(10, 2) not null,
  stock integer null default 0,
  image text null,
  barcode character varying(50) null,
  description text null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  category_id uuid null,
  constraint products_pkey primary key (id),
  constraint products_barcode_key unique (barcode),
  constraint fk_products_category foreign KEY (category_id) references categories (id) on delete set null
) TABLESPACE pg_default;

create table public.purchase_history (
  id character varying(10) not null,
  customer_id character varying(10) null,
  total numeric(10, 2) null,
  items integer null,
  payment_method character varying(20) null,
  purchase_date date null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint purchase_history_pkey primary key (id),
  constraint purchase_history_customer_id_fkey foreign KEY (customer_id) references customers (id),
  constraint purchase_history_payment_method_check check (
    (
      (payment_method)::text = any (
        (
          array[
            'cash'::character varying,
            'card'::character varying,
            'mobile'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create table public.sale_items (
  id serial not null,
  sale_id character varying(10) null,
  product_id character varying(10) null,
  quantity integer not null,
  price numeric(10, 2) not null,
  constraint sale_items_pkey primary key (id),
  constraint sale_items_product_id_fkey foreign KEY (product_id) references products (id),
  constraint sale_items_sale_id_fkey foreign KEY (sale_id) references sales (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.sales (
  id character varying(10) not null,
  customer_id character varying(10) null,
  customer_name character varying(255) null,
  subtotal numeric(10, 2) null,
  tax numeric(10, 2) null,
  discount numeric(10, 2) null,
  total numeric(10, 2) null,
  payment_method public.payment_method_enum null,
  amount_received numeric(10, 2) null,
  change_amount numeric(10, 2) null,
  sale_date date null,
  sale_time time without time zone null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint sales_pkey primary key (id),
  constraint sales_customer_id_fkey foreign KEY (customer_id) references customers (id)
) TABLESPACE pg_default;