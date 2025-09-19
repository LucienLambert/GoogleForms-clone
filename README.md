# Projet prid-2425-a01 - MyForms
# GoogleForms-Clone

Ce projet a été réalisé dans le cadre d'un projet scolaire, en collaboration avec deux autres étudiants. 
Il a permis de mettre en pratique des compétences en C#, ASP.NET Core, Angular et LINQ, tout en travaillant en équipe.
Une application web inspirée de Google Forms permettant de créer et gérer des formulaires, collecter des réponses et visualiser les résultats.

---

## 🚀 Table des matières

- [À propos](#à-propos)  
- [Technologies utilisées](#technologies-utilisées)  
- [Fonctionnalités](#fonctionnalités)  
- [Installation & utilisation](#installation--utilisation)  
- [Architecture du projet](#architecture-du-projet)  
- [Limitations & améliorations possibles](#limitations--améliorations-possibles)  
- [Capture d'écran](#capture-décran)  
- [Contact](#contact)  
- [Licence](#licence)

---

## À propos

Ce projet est une reproduction simplifiée de Google Forms, développé pour mettre en pratique des compétences en **C#, ASP.NET Core, Angular et LINQ**.  

Il permet à un utilisateur de :

- créer/éditer des formulaires avec différents types de questions,
- suppression des formulaires en cascade,
- collecter des réponses,
- visualiser les résultats,
- gestion des droits d'accès et rôles par formulaire
- gérer les formulaires de façon dynamique.

---

## Technologies utilisées

### Backend
- **Framework** : ASP.NET Core 8.0 (C#)  
- **Base de données** : SQLite (développement), SQL Server (production)  
- **ORM** : Entity Framework Core 8 avec LINQ  
- **Authentification** : JWT (Json Web Tokens)  
- **Documentation API** : Swagger (Swashbuckle)  
- **Librairies supplémentaires** :
  - AutoMapper (mapping entités ↔ DTO)
  - FluentValidation (validation des modèles)

### Frontend
- Angular (TypeScript)
- HTML & CSS
- (Ajouter Bootstrap / Material si utilisé)

---

## Fonctionnalités

- Création d’un formulaire (titre, description, type de question, public or not)
- partage de formulaire et données entre utilisateurs
- Ajout, suppression, modification de questions (texte, combo, radio, checkbox)
- Envoi de réponses par un utilisateur  
- Visualisation des résultats du formulaire  
- Validation des données côté frontend et backend   
- Documentation interactive de l’API avec Swagger

---

## Installation

1. Cloner le dépôt :  
   ```bash
   git clone https://github.com/LucienLambert/GoogleForms-clone.git
  

### Liste des utilisateurs et mots de passe

id	last_name	first_name	email	                password	birth_date	role
1	Penelle	    Benoît	    bepenelle@epfc.eu	    Password1,		        user
2	Lacroix	    Bruno	      brlacroix@epfc.eu	    Password1,		        user
3	Pigeolet	  Xavier	    xapigeolet@epfc.eu	  Password1,		        user
4	Verhaegen	  Boris	      boverhaegen@epfc.eu	  Password1,		        user
5	Admin	      Istrator	  admin@epfc.eu	        Password1,		        admin
6	Student#1	              student1@epfc.eu	    Password1,		        user
7	Student#2	              student2@epfc.eu	    Password1,		        user
8	Student#3	              student3@epfc.eu	    Password1,		        user
9	Anonymous	  User	      guest@epfc.eu                		            guest

