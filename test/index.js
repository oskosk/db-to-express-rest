var request = require('supertest'),
  express = require('express'),
  dbtoexpress = require("..");

var app = express();
app.use("/api", dbtoexpress("cars"));

app.listen(3000);

  describe('GET /api/cars', function(){
    it('respond with docuemnt list', function(done){
      request(app)
        .get('/api/cars')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    })
  })

  describe('POST /api/cars', function(){
    it('respond with json', function(done){
      request(app)
      .post('/api/cars')
      .send({model: "Renault 12"})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err,res) {
        describeGetDocument(res.body._id);
        describeUpdateDocument(res.body._id);
        describeRemoveDocument(res.body._id);
        done()
       });
    })
  })

  function describeRemoveDocument(_id) {
    describe('DELETE /api/cars/'+_id, function(){
      it('Removes document', function(done){
        request(app)
          .delete('/api/cars/'+_id)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200, done);
      })
    })
  }

  function describeUpdateDocument(_id) {
    describe('PUT /api/cars/'+_id, function(){
      it('updates document', function(done){
        request(app)
          .put('/api/cars/'+_id)
          .send({year:2005})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200, done);
      })
    })
  }

  function describeGetDocument(_id) {
    describe('GET /api/cars/'+_id, function(){
      it('respond with document', function(done){
        request(app)
          .get('/api/cars/'+_id)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200, done);
      })
    })
  }

