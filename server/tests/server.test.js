const expect = require('expect');
const  request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    text: 'first test to do'
},{
    text: 'second test to do'
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


