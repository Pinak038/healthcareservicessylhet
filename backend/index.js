const express = require('express');
const cors = require('cors');
const SSLCommerzPayment = require('sslcommerz-lts')
const { uuid } = require('uuidv4');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const store_id = 'healt65d612054b8f8';
const store_passwd = 'healt65d612054b8f8@ssl';
const is_live = false;
// STRIPE_SECRET




const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = process.env.MONGO_URL;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}





async function run() {

    try {
        const appointmentOptionCollection = client.db('healthcareservicessylhet').collection('appointmentoptions');
        const bookingsCollection = client.db('healthcareservicessylhet').collection('bookings');
        const usersCollection = client.db('healthcareservicessylhet').collection('users');
        const doctorsCollection = client.db('healthcareservicessylhet').collection('doctors');
        const paymentsCollection = client.db('healthcareservicessylhet').collection('payments');
        const specialtyCollection = client.db('healthcareservicessylhet').collection('specialties');
        const itemCategoriesCollection = client.db('healthcareservicessylhet').collection('itemcategories');
        const itemsCollection = client.db('healthcareservicessylhet').collection('items');
        const ordersCollection = client.db('healthcareservicessylhet').collection('orders');

        // verify admin middleware
        // checks admin access
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }


        // GET specialties list
        app.get('/specialties', async (req, res) => {
            const specialties = await specialtyCollection.find().toArray();
            res.send(specialties);
        });


        // GET appointmentOptions list
        // Not used
        app.get('/appointmentOptions', async (req, res) => {
            const date = req.query.date;
            console.log(date);
            const query = {};
            const options = await appointmentOptionCollection.find(query).toArray();

            //  get the bookings of the provided date
            const bookingQuery = { appointmentDate: date }
            const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray();

            // code carefully :D
            options.forEach(option => {
                const optionBooked = alreadyBooked.filter(book => book.treatment === option.name);
                const bookedSlots = optionBooked.map(book => book.slot);
                const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
                option.slots = remainingSlots;
            })
            res.send(options);
        });


        // GET appointmentOptions list V2
        app.get('/v2/appointmentOptions', async (req, res) => {
            const date = req.query.date;
            const options = await appointmentOptionCollection.aggregate([
                {
                    $lookup: {
                        from: 'bookings',
                        localField: 'name',
                        foreignField: 'treatment',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$appointmentDate', date]
                                    }
                                }
                            }
                        ],
                        as: 'booked'
                    }
                },
                {
                    $project: {
                        name: 1,
                        price: 1,
                        slots: 1,
                        booked: {
                            $map: {
                                input: '$booked',
                                as: 'book',
                                in: '$$book.slot'
                            }
                        }
                    }
                },
                {
                    $project: {
                        name: 1,
                        price: 1,
                        slots: {
                            $setDifference: ['$slots', '$booked']
                        }
                    }
                }
            ]).toArray();
            res.send(options);
        })

        // GET apointmentSpecialty 
        //not used
        app.get('/appointmentSpecialty', async (req, res) => {
            const query = {}
            const result = await appointmentOptionCollection.find(query).project({ name: 1 }).toArray();
            res.send(result);
        })


        /***
* API Naming Convention 
* app.get('/bookings')
* app.get('/bookings/:id')
* app.post('/bookings')
* app.patch('/bookings/:id')
* app.delete('/bookings/:id')
*/
        // GET bookings list for users or doctor
        app.get('/bookings', verifyJWT, async (req, res) => {
            const { email, doctor } = req.query;

            let query = {};

            if (email) {
                const decodedEmail = req.decoded.email;

                if (email !== decodedEmail) {
                    return res.status(403).send({ message: 'forbidden access' });
                }


                query = { email: email };
            }
            else if (doctor) {
                query = { doctor: doctor, paymentStatus: 'paid' };
            }


            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);

        });

        // GET bookings by id
        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        })

        // POST booking
        // Create new booking
        // process payment
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const bookingId = uuid()
            console.log(booking);


            const query = {
                appointmentDate: booking.appointmentDate,
                email: booking.email,
                treatment: booking.treatment
            }
            const alreadyBooked = await bookingsCollection.find(query).toArray();

            if (alreadyBooked.length) {
                const message = `You already have a booking on ${booking.appointmentDate}`
                return res.send({ acknowledged: false, message })
            }


            const result = await bookingsCollection.insertOne({
                ...booking,
                paymentStatus: 'pending',
                bookingId,
            });

            // process payment
            const paymentResponse = await handlePayment(booking.price, bookingId, 'appointment');
            console.log(paymentResponse)
            let GatewayPageURL = paymentResponse.GatewayPageURL
            return res.send({
                url: GatewayPageURL,
            })


        })


        // not used
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });



        // not used
        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })





        // JWT session creation API
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '5h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

        // Create new user
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);

            if (user.role === 'doctor') {
                const doctor = {
                    name: user.name,
                    email: user.email,
                    slots: [
                        "08.00 AM - 08.30 AM",
                        "08.30 AM - 09.00 AM",
                        "09.00 AM - 9.30 AM",
                        "09.30 AM - 10.00 AM",
                        "10.00 AM - 10.30 AM",
                        "10.30 AM - 11.00 AM",
                        "11.00 AM - 11.30 AM",
                        "11.30 AM - 12.00 AM",
                        "1.00 PM - 1.30 PM",
                        "1.30 PM - 2.00 PM",
                        "2.00 PM - 2.30 PM",
                        "2.30 PM - 3.00 PM",
                        "3.00 PM - 3.30 PM",
                        "3.30 PM - 4.00 PM",
                        "4.00 PM - 4.30 PM",
                        "4.30 PM - 5.00 PM"
                    ],
                    price: 99,
                    isApproved: false,
                }
                await doctorsCollection.insertOne(doctor);
            }
            res.send(result);
        });

        // list users api
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        // check admin user by email
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })


        // make user admin
        app.put('/users/admin/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        // temporary to update price field on appointment options
        app.get('/addPrice', async (req, res) => {
            const filter = {}
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    price: 99
                }
            }
            const result = await appointmentOptionCollection.updateMany(filter, updatedDoc, options);
            res.send(result);
        })







        // get approved doctors list by specialty
        app.get('/doctors', async (req, res) => {
            const { specialty, date } = req.query;
            let doctors = [];
            const query = {};
            if (specialty) {
                query.specialty = specialty;
                query.isApproved = true;
            }
            if (!date) {
                doctors = await doctorsCollection.find(query).toArray();
            }

            else {
                doctors = await doctorsCollection.aggregate([
                    { $match: query },
                    {
                        $lookup: {
                            from: 'bookings',
                            localField: 'name',
                            foreignField: 'doctor',
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$appointmentDate', date]
                                        }
                                    }
                                }
                            ],
                            as: 'booked'
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            price: 1,
                            slots: 1,
                            image: 1,
                            booked: {
                                $map: {
                                    input: '$booked',
                                    as: 'book',
                                    in: '$$book.slot'
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            price: 1,
                            image: 1,
                            slots: {
                                $setDifference: ['$slots', '$booked']
                            }
                        }
                    }
                ]).toArray();
            }

            res.send(doctors);
        })
        
        // check doctor by email
        app.get('/doctors/getByEmail/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const query = { email }
                const result = await doctorsCollection.findOne(query);
                if (!result) {
                    return res.status(404).send();
                }
                return res.send(result);
            } catch (err) {
                console.log(err)
                return res.status(404).send()
            }

        })

        // create new doctor
        app.post('/doctors', verifyJWT, verifyAdmin, async (req, res) => {
            const doctor = req.body;
            const result = await doctorsCollection.insertOne(doctor);
            res.send(result);
        });

        // update doctor profile
        app.put('/doctors/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            delete body.isApproved;
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: body,
            }

            const result = await doctorsCollection.update(filter, updatedDoc);
            res.send(result);
        })

        // approve doctor
        app.put('/doctors/:id/approve', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    isApproved: true
                },
            }

            const result = await doctorsCollection.update(filter, updatedDoc);
            res.send(result);
        })

        // delete doctor
        app.delete('/doctors/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await doctorsCollection.deleteOne(filter);
            res.send(result);
        })

        // create category
        app.post('/itemCategories', verifyJWT, verifyAdmin, async (req, res) => {
            const itemCategory = req.body;
            const result = await itemCategoriesCollection.insertOne(itemCategory);
            res.send(result);
        });

        // get category list
        app.get('/itemCategories', async (req, res) => {
            const result = await itemCategoriesCollection.find().toArray();
            res.send(result);
        })

        // remove category
        app.delete('/itemCategories/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await itemCategoriesCollection.deleteOne(filter);
            res.send(result);
        })

        // get item list for a category
        app.get('/items', async (req, res) => {
            const { category } = req.query;
            let items = [];
            const query = {};
            if (category) {
                query.category = category;
            }
            items = await itemsCollection.find(query).toArray();

            res.send(items);
        })

        // add new item 
        app.post('/items', verifyJWT, verifyAdmin, async (req, res) => {
            const item = req.body;
            const result = await itemsCollection.insertOne(item);
            res.send(result);
        });

        // edit items
        app.put('/items/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: body,
            }

            const result = await itemsCollection.update(filter, updatedDoc);
            res.send(result);
        })

        // delete item
        app.delete('/items/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await itemsCollection.deleteOne(filter);
            res.send(result);
        })

        // get order list
        app.get('/orders', verifyJWT, async (req, res) => {
            const { email } = req.query;
            let items = [];
            let query = {};
            if (email) {
                query.email = email;
            }
            items = await ordersCollection.find(query).toArray();

            res.send(items);
        })

        // handle payment by sslcommerz
        function handlePayment(price, id, type) {
            const data = {
                total_amount: parseInt(price),
                currency: 'BDT',
                tran_id: 'REF123', // use unique tran_id for each api call
                success_url: `http://localhost:5000/payment/success?id=${id}&type=${type}`,
                fail_url: `http://localhost:5000/payment/failure?id=${id}&type=${type}`,
                cancel_url: 'http://localhost:3030/cancel',
                ipn_url: 'http://localhost:3030/ipn',
                shipping_method: 'Courier',
                product_name: 'Computer.',
                product_category: 'Electronic',
                product_profile: 'general',
                cus_name: 'Customer Name',
                cus_email: 'customer@example.com',
                cus_add1: 'Dhaka',
                cus_add2: 'Dhaka',
                cus_city: 'Dhaka',
                cus_state: 'Dhaka',
                cus_postcode: '1000',
                cus_country: 'Bangladesh',
                cus_phone: '01711111111',
                cus_fax: '01711111111',
                ship_name: 'Customer Name',
                ship_add1: 'Dhaka',
                ship_add2: 'Dhaka',
                ship_city: 'Dhaka',
                ship_state: 'Dhaka',
                ship_postcode: 1000,
                ship_country: 'Bangladesh',
            };
            const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
            return sslcz.init(data);
        }

        // create new order
        app.post('/orders', verifyJWT, async (req, res) => {
            const order = req.body;
            const orderId = uuid()
            const result = await ordersCollection.insertOne({
                ...order,
                paymentStatus: 'pending',
                orderId,
            });
            const item = await itemsCollection.findOne({
                name: order.item
            });
            const remainingstock = parseInt(item.stock) - parseInt(order.count);
            await itemsCollection.update({
                name: order.item
            }, {
                $set: {
                    stock: remainingstock
                },
            });
            console.log(result)
            const paymentResponse = await handlePayment(order.price, orderId, 'item');
            console.log(paymentResponse)
            let GatewayPageURL = paymentResponse.GatewayPageURL
            return res.send({
                url: GatewayPageURL,
            })
        });

        // handle payment success
        app.post('/payment/success', async (req, res) => {
            const { type, id } = req.query;
            if (type === 'item') {
                const result = await ordersCollection.update({
                    orderId: id,
                }, {
                    $set: {
                        paymentStatus: 'paid'
                    },
                });
                if (result.modifiedCount > 0) {
                    res.redirect('http://localhost:3000/dashboard/orders');
                }
            }
            else if (type === 'appointment') {
                const result = await bookingsCollection.update({
                    bookingId: id,
                }, {
                    $set: {
                        paymentStatus: 'paid'
                    },
                });
                if (result.modifiedCount > 0) {
                    res.redirect('http://localhost:3000/dashboard/myappointments');
                }
            }
        });

        // handle payment failure
        app.post('/payment/failure', async (req, res) => {
            const { type, id } = req.query;
            if (type === 'item') {
                const result = await ordersCollection.update({
                    orderId: id,
                }, {
                    $set: {
                        paymentStatus: 'failed'
                    },
                });
                const order = await ordersCollection.findOne({
                    orderId: id,
                });
                const item = await itemsCollection.findOne({
                    name: order.item,
                });
                const updatedStock = parseInt(item.stock) + parseInt(order.count);
                await itemsCollection.update({
                    name: order.item,
                },{
                    $set: {
                        stock: updatedStock
                    },
                });
                if (result.modifiedCount > 0) {
                    res.redirect('http://localhost:3000/dashboard/orders');
                }
            }
            else if (type === 'appointment') {
                const result = await bookingsCollection.update({
                    bookingId: id,
                }, {
                    $set: {
                        paymentStatus: 'failed'
                    },
                });
                if (result.modifiedCount > 0) {
                    res.redirect('http://localhost:3000/dashboard/myappointments');
                }
            }
        });


    }


    finally {

    }






}



run().catch(console.log);










app.get('/', async (req, res) => {
    res.send('doctors portal server is running');
})

app.listen(port, () => console.log(`Doctors portal running on ${port}`))