\echo 'Delete and recreate pantry_tracker db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE pantry_tracker;
CREATE DATABASE pantry_tracker;
\connect pantry_tracker

\i pantry-schema.sql

\echo 'Delete and recreate pantry_tracker_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE pantry_tracker_test;
CREATE DATABASE pantry_tracker_test;
\connect pantry_tracker_test;

\i pantry-schema.sql