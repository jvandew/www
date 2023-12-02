www
===

Personal website and all the garbage that comes with it.


# Architecture

The web backend here is a simple Python Tornado app serving templated static content. It is deployed as a Docker container onto the GCP free tier, using Certbot and an in-container Nginx to provision SSL certs and terminate connections.

# TODO

 - store SSL certs in GCP's Secret Manager rather than provisioning them on boot
 - automatically pull external IP and update DNS records as needed
 - block well known scraper paths (wordpress/php/etc stuff) at the Nginx layer
 - move to a more modern web architecture using react/typescript and whatnot
