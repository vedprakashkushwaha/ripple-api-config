function onConnect(event, callback) {
    console.log('Triggered event: ', event);    
    callback();
   
}


onConnect('event1', () => {
    setInterval(() => {console.log('event1'); }, 1000);
})

onConnect('event2', () => {
    setInterval(() => {console.log('event2'); }, 1000);
})

onConnect('event3', () => {
    setInterval(() => {console.log('event3'); }, 1000);
})
