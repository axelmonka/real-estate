//I must to change your url beacause the ad disappeard. If you want i choose this one :
// url : https://www.leboncoin.fr/ventes_immobilieres/1085823289.htm?ca=12_s

//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );
var url;

//creating a new express server
var app = express();

//setting EJS as the templating engine
app.set( 'view engine', 'ejs' );

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
app.use( '/assets', express.static( 'assets' ) );

var data = {
    price: 0,
    adrresse: "",
    Type: "",
    piece: "",
    surface: 0,
    Ville: "",
    Code: "",
}
var k

//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
app.get( '/', function ( req, res ) {
    res.render( 'home', {
        message: 'Entrez l\'url du bien à évaluer'
    });
});



//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});

//Recupere la page html
app.get( '/process', function ( req, res ) {
    url = req.query.URLLBC
    request( url, function ( error, response, body ) {
        if ( !error && response.statusCode == 200 ) {
            var $ = cheerio.load( body )
            data.price = $( 'span.value' ).eq( 0 ).text()
            data.adrresse = $( 'span[itemprop=address]' ).html()
            data.Type = $( 'span[class=value]' ).eq( 2 ).text()
            data.piece = $( 'span[class=value]' ).eq( 3 ).text()
            data.surface = $( 'span[class=value]' ).eq( 4 ).text()
            data.price = parseFloat( data.price.trim().split( ' ' )[0] * 1000 + parseFloat( data.price.trim().split( ' ' )[1] ) ) / parseFloat( data.surface )
            data.Ville = data.adrresse.split( ' ' )[0]
            data.Code = data.adrresse.split( ' ' )[1]

            request( 'https://www.meilleursagents.com/prix-immobilier/' + data.Ville.toLowerCase() + '-' + data.Code, function ( error, response, body ) {
                if ( !error && response.statusCode == 200 ) {
                    var $$ = cheerio.load( body )
                    var Meanprice = $$( 'div.small-4.medium-2.columns.prices-summary__cell--median' ).eq( 0 ).text()
                    Meanprice = Meanprice.split( ' ' )[12]
                    var MeanpriceMaison = $$( 'div.small-4.medium-2.columns.prices-summary__cell--muted' ).eq( 0 ).text()
                    MeanpriceMaison = Meanprice.split( ' ' )[12]
                    Meanprice = Meanprice.replace( ' ', '' )
                    Meanprice = parseFloat( Meanprice )
                    data.price = parseInt( data.price )
                    if ( data.Type == 'Appartement' ) {
                        if ( Meanprice > data.price ) {
                            res.render( 'home', {
                                message: 'Resultat : It is a good deal.' + '   Prix au m2 moyen : ' + Meanprice + ' € ' + '   Prix au m2 du bien : ' + data.price + ' € '
                            });
                        }
                        else {
                            res.render( 'home', {
                                message: 'Résultat : It is not a good deal.' + '   Prix au m2 moyen : ' + Meanprice + ' € ' + '   Prix au m2 du bien : ' + data.price + ' € '
                            });
                        }
                    }
                    else {
                        if ( MeanpriceMaison > data.price ) {
                            res.render( 'home', {
                                message: 'Resultat : It is a good deal.' + '   Prix au m2 moyen : ' + MeanpriceMaison + ' € ' + '   Prix au m2 du bien : ' + data.price + ' € '
                            });
                        }
                        else {
                            res.render( 'home', {
                                message: 'Resultat : It is not a good deal.' + '   Prix au m2 moyen : ' + MeanpriceMaison + ' € ' + '   Prix au m2 du bien : ' + data.price + ' € '
                            });
                        }
                    }
                }
            })
        }
    })
});
