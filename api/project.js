define("ProjectApiController", ["ProjectSchema", "Project", "crypto-js/md5"], function(ProjectSchema, Project, MD5) {
    
    return class ProjectApiController {

        /**
         * Managing users stored in the database.
         * @constructor
         */
        constructor() {

        }

        /**
         * Retrieve a project (@TODO: check for active only)
         *
         * @param {string} id - The project id to search for.
         * @param {string} username - The username that owns the project.
         * @return {ProjectSchema} The project object from database if found, otherwise null.
         */
        static get_project(id, username) {
            return new Promise(resolve => {
                ProjectSchema.findOne({ id: id, user_id: username/*, active: true*/ }).then(function(project) {
                    resolve(project);
                });
            });
        }    
        
        /**
         * Import a project, replacing the existing one
         *
         * @param {ProjectSchema} project - The project to import.
         * @param {string} username - The username that owns the project.
         * @return {boolean} True if success, false if failed.
         */
         static import_project(project, project_id, username) {
            return new Promise(resolve => {
                ProjectSchema.deleteOne({ id: project_id, user_id: username }).then(function(res) {
                    console.log('jan1');

                    if (res.deletedCount == 0) {
                        resolve(false);
                    }
                    else {
                        // Add new project
                        Project.fromJSON(JSON.parse(project)).then(function(p) {
                            console.log(p);

                            var newschema = ProjectSchema.fromModel(p);
                            newschema.id = project_id;
                            newschema.user_id = username;

                            newschema.save().then(function(e) {
                                resolve(true);
                            }).catch(function(error) {
                                console.log(error);
                                resolve(false);
                            });
    
                        });
                    }
                });
            });
        }        
            
        /**
         * Retrieve all projects belonging to the current user from database.
         *
         * @return {string[]} Array of projects present in database.
         */
        static get_projects(user) {
            return new Promise(resolve => {
            ProjectSchema.find({ user_id: user }).then(function(projects) {
                var projects_return = [];
    
                for (var p in projects) {
                projects_return.push({
                    id: projects[p].id,
                    name: projects[p].name,
                    status: projects[p].status
                    });
                }
    
                projects_return.sort((a, b) => (a.name > b.name) ? 1 : -1);
    
                resolve(projects_return);
            });
            });
        }
        
        /**
         * Create a new account and store it in the database.
         *
         * @param {string} user - Username
         * @return {boolean} true if project created successfully, false if not.
         */
        static create_project(user) {
            return new Promise(resolve => {
            var schema = new ProjectSchema();

            // Generate a unique id
            schema.id = MD5('tb' + user + Date.now());
            schema.user_id = user;
            schema.status = 0; // paused by default

            schema.save().then(function(e) {
                resolve(e);
            }).catch(function(error) {
                resolve(error);
            });
            });
        }
        
    }

});