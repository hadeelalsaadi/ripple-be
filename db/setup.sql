DROP DATABASE IF EXISTS ripple_test;
DROP DATABASE IF EXISTS ripple;


CREATE DATABASE ripple_test;
CREATE DATABASE ripple;
\c ripple_test;

CREATE EXTENSION postgis;
CREATE EXTENSION postgis_raster;
CREATE EXTENSION fuzzystrmatch; --needed for postgis_tiger_geocoder
--optional used by postgis_tiger_geocoder, or can be used standalone
CREATE EXTENSION address_standardizer;
CREATE EXTENSION address_standardizer_data_us;
CREATE EXTENSION postgis_tiger_geocoder;
CREATE EXTENSION postgis_topology ;

\c ripple;

CREATE EXTENSION postgis;
CREATE EXTENSION postgis_raster;
CREATE EXTENSION fuzzystrmatch; --needed for postgis_tiger_geocoder
--optional used by postgis_tiger_geocoder, or can be used standalone
CREATE EXTENSION address_standardizer;
CREATE EXTENSION address_standardizer_data_us;
CREATE EXTENSION postgis_tiger_geocoder;
CREATE EXTENSION postgis_topology;

