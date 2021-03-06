const expect = require('expect');
const  request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} =require('./../models/user');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('Post /todos', () => {
    it('should create a new Todo', (done) => {
        var text = 'Test todo text';

        request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.find().then((todo) => {
                expect(todo.length).toBe(3);
                expect(todo[2].text).toBe(text);
                done();
            }).catch((e) => done(e));
        });
        //it('should not create a todo with ivalid data', (done) => {});
    });
});

describe('GET /todos', () => {
    it('should get an array of todos', (done) => {
        request(app)
        .get('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(1);
        })
        .end(done);
    });
});
describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        var hexCode = todos[0]._id.toHexString();
        request(app)
        .get(`/todos/${hexCode}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(todos[0].text);
        })
        .end(done);
    });
    it('should not return todo doc created by other user', (done) => {
        var hexCode = todos[0]._id.toHexString();
        request(app)
        .get(`/todos/${hexCode}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end(done);
    });
    it('should return 404 if todo not found', (done) => {
        request(app)
        .get(`/todos/${(new ObjectID()).toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
    it('should return 404 for non-object ids', (done) => {
        request(app)
        .get('/todos/123')
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    })
});

describe('DELETE /todos/:id', (done) => {
    it('should delete a todo', (done) => {
         var hexId = todos[1]._id.toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.result._id).toBe(hexId);
        })
        .end((err, res) => {
            if(err){
                return done(err);
            }
            Todo.findById(hexId).then((todo) => {
                expect(todo).toNotExist();
                done();
            }).catch((e) => done(e));
    });});
    it('should not delete a todo created by another user', (done) => {
        var hexId = todos[1]._id.toHexString();
       request(app)
       .delete(`/todos/${hexId}`)
       .set('x-auth', users[0].tokens[0].token)
       .expect(404)
       .end((err, res) => {
        if(err){
            return done(err);
        }
        Todo.findById(hexId).then((todo) => {
            expect(todo).toExist();
            done();
        }).catch((e) => done(e));
    });
   it('should return 404 if id is not found', (done) =>{
    request(app)
    .delete(`/todos/${(new ObjectID()).toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
    .end(done);
   });
});
   
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        var id = todos[0]._id.toHexString();
        var text = 'Hello, we got result';
        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .send({text, completed: true})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.completed)
            .toBeA('boolean')
            .toBe(true);
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completedAt)
            .toBeA('number');
        })
        .end(done);
    });
    it('should not update the todo created by another user', (done) => {
        var id = todos[0]._id.toHexString();
        var text = 'Hello, we got result';
        var oldText = todos[0].text;
        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth', users[1].tokens[0].token)
        .send({text, completed: true})
        .expect(404)
        .end((err, res) => {
            if(err){
                return done(err);
            }
            Todo.findById(id).then((todo) => {
                expect(todo.completed).toBe(false);
                expect(todo.text).toBe(oldText);
                expect(todo.completedAt).toNotExist();
                return done();
            }).catch((e) => done(e));
        });
    });
    it('should clear completedAt when to do is not comleted', (done) => {
        var id = todos[1]._id.toHexString();
        var text = 'Hello, we got result';
        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth', users[1].tokens[0].token)
        .send({text, completed: false})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.completed).toBeA('boolean').toBe(false);
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completedAt).toNotExist();
        })
        .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        console.log(users[0].tokens);
        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });
    it('should return 401 status when unauthenticated', (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth','')
        .expect(401)
        .expect((res) => {
            expect(res.body).toEqual({});
        })
        .end(done);
    });
});

describe('POST /users', () => {
    it('should create user', (done) => {
        var email = 'hello@pick.com';
        var password = 'getthe200';
        
        
        request(app)
        .post('/users')
        .send({email, password})
        .expect(200)
        .expect((res) => {
            expect(res.body._id).toExist();
            expect(res.body.email).toBe(email);
            expect(res.get('x-auth')).toExist();
        })
        .end((err) => {
            if(err){
                return done(err);
            }
            User.findOne({email}).then((user) => {
                expect(user).toExist();
                expect(user.password).toNotBe(password);
                done();
            });
        });
    });
    it('shoud return validation errors if request is invalid', (done) => {
        var email = 'cbwieubfc';
        var password = 'clkinwi';
        
        request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end((err) => done(err));
    });
    it('should not create a user if email in use', (done) => {
        var email = users[0].email;
        var password = 'cw;oiocp';

        request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .expect(() => {
            
        })
        .end((err) => {
            User.find({email}).then((list) => {
                expect(list.length).toBe(1);
            });
            done();
        });
    });
});
describe('POST /users/login', () => {
    it('should login user and return token', (done) => {
        request(app)
        .post('/users/login')
        .send({email: users[1].email, password: users[1].password})
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toExist();
        })
        .end((err, response) => {
            if(err){
                return done(err);
            }
            User.findById(users[1]._id).then((user) => {
                expect(user.tokens[1]).toInclude({
                    access: 'auth',
                    token: response.headers['x-auth']
                }); 
                return done();
            }).catch((e) => done(e));
        });
    });
    it('should reject invalid login', (done) => {
        request(app)
        .post('/users/login')
        .send({email: 'not@existing.mail', password: 'forNotExistingMail'})
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
        })
        .end((err, response) => {
            if(err){
                return done(err);
            }
            User.findById(users[1]._id).then((user) => {
                expect(user.tokens.length).toBe(1);
                return done();
            }).catch((e) => done(e));
        });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token from the tokens array', (done) => {
        request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err, res) => {
            if (err){
                return done(err);
            }else{
                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                     return done();
                }).catch((e) => {
                    return done(e);
                });
               
            }
        });
    });
});

