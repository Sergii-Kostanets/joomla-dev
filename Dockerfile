FROM php:8.1-apache

# RUN mkdir /home/www-data \
#   && usermod  --uid 1000 -d /home/www-data www-data \
#   && groupmod --gid 1000 www-data \
#   && chown www-data:www-data -R /home/www-data

# USER www-data

EXPOSE 80