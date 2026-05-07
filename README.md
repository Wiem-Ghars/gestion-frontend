# GestionFrontend

Frontend Angular 16 pour la gestion des projets, employes, categories et affectations, avec separation des espaces Admin et Employee.

## Stack

- Angular 16
- Angular Material
- Reactive Forms
- HttpClient
- Lazy loading par module

## Architecture du projet

L application est decoupee en feature modules et modules transverses:

- app
	- app-routing.module.ts: routage racine, lazy loading, protections par roles
	- app.module.ts: module racine
- auth
	- login et routage public
- admin
	- layout (shell + sidebar)
	- dashboard, employees, categories, projets, affectations
- employee
	- dashboard, projets
- core
	- models (interfaces de donnees)
	- services (API REST)
	- guards (auth, admin, employee)
- shared
	- mutualisation CommonModule, Forms/ReactiveForms, Angular Material

## Routage (vue d ensemble)

- /login -> AuthModule
- /admin -> AdminModule (protege par adminGuard)
- /employee -> EmployeeModule (protege par employeeGuard)
- redirections:
	- / -> /login
	- toute route inconnue -> /login

## Ce qui est implemente

- Authentification front:
	- formulaire de login avec validation
	- appel API login/logout
	- gestion de session locale via localStorage
	- redirection automatique selon role (ADMIN ou EMPLOYEE)
- Securite de navigation:
	- adminGuard
	- employeeGuard
	- structure de authGuard prete
- Structure applicative:
	- lazy loading des modules Auth, Admin et Employee
	- shell admin avec navigation laterale et bouton logout
- Couche services API (core/services):
	- AuthService
	- EmployeeService (CRUD)
	- CategorieService (CRUD)
	- ProjetService (CRUD + getMine)
	- AffectationService (liste, filtrage projet, current, create, delete)

## Ce qui n est pas encore implemente (ou incomplet)

- Logique metier des composants feature:
	- admin/employees, admin/categories, admin/projets, admin/affectations
	- employee/dashboard, employee/projets
	- ces composants existent mais leurs classes TypeScript sont encore vides
- Contenu des pages dashboard:
	- admin/dashboard.html est vide
	- employee/dashboard et employee/projets affichent encore le template par defaut
- Exploitation UI des services:
	- pas encore de tableaux/formulaires CRUD relies aux services dans les composants
- Guard generique authGuard:
	- cree mais pas utilise dans le routage actuel
- Tests:
	- specs presentes mais principalement templates generes
	- pas de couverture fonctionnelle complete
- End-to-end:
	- non configure dans le projet

## Lancer le projet

1. Installer les dependances:

	 npm install

2. Lancer le serveur de developpement:

	 ng serve

3. Ouvrir:

	 http://localhost:4200

## Build

ng build

Les artefacts sont generes dans dist/.
