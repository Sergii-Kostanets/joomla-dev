FROM php:8.1-apache

RUN echo "memory_limit=128M" > /usr/local/etc/php/conf.d/docker-php-ext-custom.ini \
    && echo "upload_max_filesize=100M" > /usr/local/etc/php/conf.d/docker-php-ext-custom.ini \
    && echo "post_max_size=100M" > /usr/local/etc/php/conf.d/docker-php-ext-custom.ini

# RUN mkdir /home/www-data \
#   && usermod  --uid 1000 -d /home/www-data www-data \
#   && groupmod --gid 1000 www-data \
#   && chown www-data:www-data -R /home/www-data

# USER www-data

EXPOSE 80