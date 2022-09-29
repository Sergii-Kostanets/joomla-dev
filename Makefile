THIS_FILE := $(lastword $(MAKEFILE_LIST))
.PHONY: up down pull build
default: up

up:
	docker-compose up -d

down:
	docker-compose down

pull:
	docker pull joomla
	docker pull mysql:5.7
	docker pull php:8.1-apache
	docker pull phpmyadmin:5.2-apache
	docker pull traefik:2.9

build:
	docker-compose up -d --build --remove-orphans
