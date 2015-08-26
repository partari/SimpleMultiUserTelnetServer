var net = require('net');

//Taulukko johon tallennetaan kaikki luodut yhteydet
var sockets = [];
var listeningaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1"; 
var listeningport = process.env.OPENSHIFT_NODEJS_PORT || 15001;

//Luodaan server niminen palvelu joka palauttaa soketin
var server = net.createServer(function (socket) {

	//tervehditään käyttäjää
	socket.write('Tervehdys ' + socket.remoteAddress + ':' + socket.remotePort + '\n');
	socket.write('\n');
	
	//Tallennetaan soketti taulukkoon myöhempää iterointia varten
	sockets.push(socket);

	//Mitä tehdään kun sockettiin tulee dataa käyttäjältä?
	socket.on('data', function(data) {
		//console.log(sockets.length);
		//console.log(sockets.indexOf(socket));
		
		//Käydään "kaiutus" -prosessi läpi, eli kaiutetaan viesti kaikille käyttäjille, paitsi sille jonka soketti on laukaissut tämän prosessin alunperin
		var socketlength = sockets.length;
        for (var i = 0; i < socketlength; i ++) {
            if (sockets[i] != socket) {		//jos iteroitava soketti on eri soketti kuin mihin dataa on tullut niin sitten....
                if (sockets[i]) {			//pakko tarkistus tässä välissä, muuten kaatui...
                    sockets[i].write(data);
                }
            }
        }
	});
	
	//Kun käyttäjä poistuu (tämä pakko tarkistaa kun muuten kaatuu kun ensimmäinen käyttäjä poistuu, koska taulukko ei pysy ajantasalla.
	socket.on('end', function() {
        var socketIndex = sockets.indexOf(socket);
        if (socketIndex != -1) {
            delete sockets[socketIndex];
        }
    });
});
server.listen(listeningport, listeningaddress);
console.log('Server running at port ' + listeningport);