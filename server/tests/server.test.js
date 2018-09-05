const expect = require('expect');
const  request = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id: new ObjectID,
    text: 'first test to do'
},{
    _id: new ObjectID,
    text: 'second test to do',
    completed: true,
    completedAt: 87364917391
}

]

beforeEach((done) => {
    Todo.deleteMany({}).then(() => {
       return Todo.insertMany(todos);
    }).then(() => done());
});

describe('Post /todos', () => {
    it('should create a new Todo', (done) => {
        var text = 'Test todo text';

        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.find().then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text.toBe(text));
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
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    });
});
describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        var hexCode = todos[0]._id.toHexString();
        request(app)
        .get(`/todos/${hexCode}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(todos[0].text);
        })
        .end(done);
    });
    it('should return 404 if todo not found', (done) => {
        request(app)
        .get(`/todos/${(new ObjectID()).toHexString()}`)
        .expect(404)
        .end(done);
    });
    it('should return 404 for non-object ids', (done) => {
        request(app)
        .get('/todos/123')
        .expect(404)
        .end(done);
    })
});

describe('DELETE /todos/:id', (done) => {
    it('should delete a todo', (done) => {
         var hexId = todos[1]._id.toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.result._id).toBe(hexId);
        })
        .end((err, res) => {
            if(err){
                return done(err);
            }
            request(app)
            .get(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });});
   it('should return 404 if id is not found', (done) =>{
    request(app)
    .delete(`/todos/${(new ObjectID()).toHexString()}`)
    .expect(404)
    .end(done);
   });

   
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        var id = todos[0]._id.toHexString();
        var text = 'Hello, we got result';
        request(app)
        .patch(`/todos/${id}`)
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
    it('should clear completedAt when to do is not comleted', (done) => {
        var id = todos[1]._id.toHexString();
        var text = 'Hello, we got result';
        request(app)
        .patch(`/todos/${id}`)
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


