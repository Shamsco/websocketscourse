// const userName = prompt('What is your username?');
// const password = prompt('What is your password?');

// Temp remove prompts
const userName = "Ahmed";
const password = 'bad';

const clientOptions= {
    query:{
        userName,password
    },
    auth:{
        userName,password
    }
}

//always join the main namespace, because that's where the client gets the other namespaces from
const socket = io('http://localhost:9000', clientOptions);
// const socket2 = io('http://localhost:9000/wiki');
// const socket3 = io('http://localhost:9000/mozilla');
// const socket4 = io('http://localhost:9000/linux');

//sockets will be put into this array, in the index of their ns.id
const nameSpaceSockets = [];
const listeners = {
    nsChange: [],
    messageToRoom: [],
}

//a global variable we can update when the user clicks on a namespace
// we will use it to broadcast across the app (redux would be great here...)
let selectedNsId = 0;

//add a submit handler for our form
document.querySelector('#message-form').addEventListener('submit', (e)=>{
    //keep the browser from submitting
    e.preventDefault();
    //grab the value from the input box
    const newMessage = document.querySelector('#user-message').value;
    console.log(newMessage, selectedNsId);
    nameSpaceSockets[selectedNsId].emit('newMessageToRoom', {
        newMessage,
        date: Date.now(),
        avatar: 'https://via.placeholder.com/30',
        userName,
        selectedNsId,
    });
    document.querySelector('#user-message').value = '';
});

//addlisteners job is to manage all listeners added to all namespaces.
//this prevents listeners from being added multiple times and makes life
//better for us as developers.
const addListeners = (nsId) =>{
    if(!listeners.nsChange[nsId]){
        //nameSpaceSockets[ns.id] = thisNs;
        nameSpaceSockets[nsId].on('nsChange', (data)=>{
            console.log('Namespace Changed!');
            console.log(data);
        });
        listeners.nsChange[nsId] = true;
    }
    if(!listeners.messageToRoom[nsId]){
        //add the nsId listener to this namespace!
        nameSpaceSockets[nsId].on('messageToRoom', messageObj => {
            console.log(messageObj);
            document.querySelector('#messages').innerHTML += buildMessageHtml(messageObj);
        });
        listeners.messageToRoom[nsId] = true;
    }

}
socket.on('connect', () => {
    console.log("Connected!");
    socket.emit('clientConnect');
});

// listen for the nsList event from the server which gives us the namespaces
socket.on('nsList', (nsData) => {
    console.log(nsData);
    const nameSpacesDiv = document.querySelector('.namespaces');
    nameSpacesDiv.innerHTML = '';
    nsData.forEach(ns => {
        // update the HTML with each ns
        nameSpacesDiv.innerHTML += `<div class="namespace" ns="${ns.endpoint}"><img src="${ns.image}"></div>`
         
        //initialize thisNs as its index in nameSpaceSockets
        //If the connection is new, this will be null
        //If the connection has already been established, it will reconnect and remain in its spot
        // let thisNs =  nameSpaceSockets[ns.id];

        if(!nameSpaceSockets[ns.id]){
            //There is no socket at this nsId. so make a new connection!
            //join this namespace with io()
            nameSpaceSockets[ns.id] = io(`http://localhost:9000${ns.endpoint}`);
        }   
        addListeners(ns.id);
        

        });

    Array.from(document.getElementsByClassName('namespace')).forEach(element => {
        console.log(element);
        element.addEventListener('click', e =>{
            joinNs(element, nsData)
        })
    });

    joinNs(document.getElementsByClassName('namespace')[0], nsData)
})


