# Photobooks

Aplicación para crear álbumes de fotos y compartirlos con tus amigos.

Este repositorio es un ejemplo de una aplicación completa creada en Javascript (fullstack), incluye cosas como microservicios rest, autenticación con jsonwebtoken, SPA, material design, operaciones CRUD y más.

Puedes revisar cada una de las partes que forman la aplicación en la siguiente lista de repositorios:

- [photobooks-frontend](https://github.com/EliasBF/photobooks-frontend-real-example-app)
- [photobooks-api](https://github.com/EliasBF/photobooks-api-real-example-app)
- [photobooks-db](https://github.com/EliasBF/photobooks-db-real-example-app)
- [photobooks-client](https://github.com/EliasBF/photobooks-client-real-example-app)

## Requerimientos

- [Vagrant](https://www.vagrantup.com/downloads.html)
- [Ansible](https://docs.ansible.com/ansible/latest/intro_installation.html)
- [SSH](https://www.ssh.com/ssh/)

## Configuración

- Crear entorno virtual

```
vagrant up
```

- Crear y desplegar llave SSH en el entorno virtual para deploy:

	Para este ejemplo se utilizara el usuario root por defecto
	
	Crear llave (recomiendo crear una llave solo para este proyecto y guardarla en el directorio ssh)

	```
	ssh-keygen -t rsa -b 4096
	```

	Ingresar por ssh al entorno virtual, cambiar al usuario root y copiar la llave publica generada en ~/.ssh/authorized_keys (tu_llave_ssh.pub)

	```
	vagrant ssh # para ingresar por ssh
	sudo su - # para cambiar a root
	nano ~/.ssh/authorized_keys # para editar el archivo y copiar tu llave publica
	```

	Instalar dependencias para deploy con ansible

	```
	ansible-galaxy install jdauphant.nginx
	ansible-galaxy install zenoamaro.rethinkdb
	ansible-galaxy install geerlingguy.nodejs
	```

- Iniciar deploy

```
ansible-playbook -i inventory.ini photobooks.yml --key-file "tu_llave_ssh_privada"
```

- Añadir reglas al archivo de hosts de tu sistema operativo para acceder a la aplicación en el entorno virtual (/etc/hosts en gnu/linux)

```
192.168.68.8 photobooks.com
192.168.68.8 api.photobooks.com
```

##### Listo, inicia la aplicación ingresando desde tu navegador a http://photobooks.com
