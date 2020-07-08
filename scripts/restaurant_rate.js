var firebaseConfig = {
    apiKey: "AIzaSyDTFFrlgMNcm4J0uJixFbI5U9pIYDayUmY",
    authDomain: "wheeloninthistogether123.firebaseapp.com",
    databaseURL: "https://wheeloninthistogether123.firebaseio.com",
    projectId: "wheeloninthistogether123",
    storageBucket: "wheeloninthistogether123.appspot.com",
    messagingSenderId: "728495178731",
    appId: "1:728495178731:web:06792b904ccd5693b2cfae",
    measurementId: "G-2SRFF7XTB2"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

$(document).ready(function() {
    var urlParams = new URLSearchParams(window.location.search)
    var rest_name = urlParams.get('name')
    var rest_key = null

    //----------------INPUT STAR THANG-------------------------
    var facility_input = null;
    var access_input = null;
    var safety_input = null;
    turn_rating_on()
    $("#error-msg").hide()
    $("#error-comment").hide()
    $("#success-msg").hide()

    get_restaurant_db(rest_name).then((res) => {
        $(".spinner").hide()
        rest_key = res.key
        console.log(res.val())
        display_rating_page(res.val())
    })

    $(document).on("mouseenter", "#comment-list .card", function(){
        $(this).removeClass("shadow-sm").addClass("shadow")
    })

    $(document).on("mouseleave", "#comment-list .card", function(){
        $(this).removeClass("shadow").addClass("shadow-sm")
    })

    $("#post-btn").click(function() {
        if (facility_input == null || access_input == null || safety_input == null) {
            console.log("tested")
            $("#error-msg").slideDown()
            setTimeout(function() {
                $("#error-msg").slideUp()
            }, 5000);
        } 
        else if ($("#review-comment").val() == "") {
            $("#error-comment").slideDown()
            setTimeout(function() {
                $("#error-comment").slideUp()
            }, 5000);
        }
        else {
            $(".icon-star-fill").attr("src", "../icons/star.svg")
            $(".icon-star-fill").removeClass("icon-star-fill").addClass("icon-star")
            turn_rating_on()
            $("#ratingModal").modal('hide')
            var input_data = {
                facility: facility_input,
                accessibility: access_input,
                safety: safety_input,
                comment: $("#review-comment").val(),
                username: "wheelie"
            }
            console.log(input_data)
            console.log(rest_key)
            insert_new_comment(rest_key, input_data).then(function() {
                //Refresh and add the new comment
                $("#comment-list").prepend(comment_format(input_data))
                $("#rating-modal").modal('hide')
                $("#success-msg").slideDown()
                setTimeout(function() {
                    $("#success-msg").slideUp()
                }, 2000);
            })
        }
    })


    function turn_rating_on() {
        $(".icon-star").hover(function() {
            $(this).attr("src", "../icons/star-fill.svg")
            $(this).removeClass("icon-star").addClass("icon-star-fill")
            var star_val = parseInt($(this).data('value'))
            
            //Highlight all the required star
            $(this).parent().children().each(function() {
                if ($(this).data('value') < star_val) {
                    $(this).attr("src", "../icons/star-fill.svg")
                    $(this).removeClass("icon-star").addClass("icon-star-fill")
                }
            })
        // }
        }, function() {
            $(this).attr("src", "../icons/star.svg")
            $(this).removeClass("icon-star-fill").addClass("icon-star")
            var star_val = parseInt($(this).data('value'))
            
            //Remove the highlight of all the required star
            $(this).parent().children().each(function() {
                if ($(this).data('value') < star_val) {
                    $(this).attr("src", "../icons/star.svg")
                    $(this).removeClass("icon-star-fill").addClass("icon-star")
                }
            })
        })
    
        //Store chosen value
        $(".icon-star").click(function() {
            $(this).off('mouseenter mouseleave')
            $(this).attr("src", "../icons/star-fill.svg")
            $(this).removeClass("icon-star").addClass("icon-star-fill")
            var star_val = parseInt($(this).data('value'))
            var category = $(this).parent().attr('id')
            //Highlight all the required star
            $(this).parent().children().each(function() {
                $(this).off('mouseenter mouseleave')
                if ($(this).data('value') <= star_val) {
                    $(this).attr("src", "../icons/star-fill.svg")
                    $(this).removeClass("icon-star").addClass("icon-star-fill")
                } else {
                    $(this).attr("src", "../icons/star.svg")
                    $(this).removeClass("icon-star-fill").addClass("icon-star")
                }
            })
            if (category=="facility-input") {
                facility_input = star_val
                console.log(star_val)
            }
            else if (category=="accessibility-input") {
                access_input = star_val
                console.log(star_val)
            }
            else {
                safety_input = star_val
                console.log(star_val)
            }
            console.log(category)
        })
    
    }
})

async function get_restaurant_db(rest_name) {
    try {
        var ref = firebase.database().ref("restaurant/")
        var result = null
        await ref.orderByChild('name').equalTo(rest_name).once('value', function(snapshot) {
            snapshot.forEach(res => {
                result = res
            });
        })
        await display_image(rest_name)
    }
    finally {
        return result
    }
}

async function display_image(rest_name) {
    try {
        var img_ref = firebase.storage().ref('restaurants/'+rest_name+'/'+rest_name+'.jpg')
        img_ref.getDownloadURL().then(function(url) {
            //Display the image
            console.log('tes')
            $(".rstrnt-img").attr("src", url)
        })
    }
    catch(error) {
        console.log(error)
    }
}

function comment_format(rating_entry) {
    const user_rating = rating_entry
    //Comment star
    var facility_star = "<div class='col-lg-6 col-md-6 col-sm-6 col-6'><h5>" + generate_star(user_rating.facility) +"</h5></div>"
    var facility_title = "<div class='col-lg-5 col-md-6 col-sm-6 col-6'><h5 class='category-title'> Facility </h5></div>"
    var facility_combined = "<div class='row'>" + facility_title + facility_star + "</div>"

    var access_star = "<div class='col-lg-6 col-md-6 col-sm-6 col-6'><h5>" + generate_star(user_rating.accessibility) +"</h5></div>"
    var access_title = "<div class='col-lg-5 col-md-6 col-sm-6 col-6'><h5 class='category-title'> Accessibility </h5></div>"
    var access_combined = "<div class='row'>" + access_title + access_star + "</div>"

    var safety_star = "<div class='col-lg-6 col-md-6 col-sm-6 col-6'><h5>" + generate_star(user_rating.safety) +"</h5></div>"
    var safety_title = "<div class='col-lg-5 col-md-6 col-sm-6 col-6'><h5 class='category-title'> Safety </h5></div>"
    var safety_combined = "<div class='row'>" + safety_title + safety_star + "</div>"

    var overall = Math.floor((user_rating.facility + user_rating.accessibility + user_rating.safety)/3)
    var overall_star = "<div class='col-lg-6 col-md-6 col-sm-6 col-6'><h5>" + generate_star(overall, 30) + "</h5></div>"
    var overall_title = "<div class='col-lg-5 col-md-6 col-sm-6 col-6'><h3 class='category-title'> Overall</h3></div>"
    var overall_combined = "<div class='row mb-1'>" + overall_title + overall_star + "</div>"

    var stars = "<div class='col-lg-6 col-md-7 col-sm-12 col-12'>" + overall_combined + facility_combined + access_combined + safety_combined + "</div>"

    var review_desc = "<div class='col-lg-6 col-md-5 border-left review-desc'><p>" + user_rating.comment + "</p></div>"

    var card_body = "<div class='card-body row'>" + stars + review_desc + "</div>"

    var user_pics = "<div class='col-lg-1 col-md-1 col-sm-3 col-1 text-right'><img src='../icons/person-circle.svg' width='24' height='24'></div>"
    var user_name = "<div class='col-lg-2 col-md-2 col-sm-4 col-4 username align-middle pl-0'>" + user_rating.username + "</div>"
    var comment_like = "<div class='col-lg-9 col-md-4 col-sm-5 col-7 border-left border-secondary'><img src='../icons/heart.svg' width='18' height='18'><span class='mx-2 likes-and-comment'> 24 Likes </span></div>"

    var card_footer = "<div class='card-footer'><div class='row'>" + user_pics + user_name + comment_like + "</div></div>"

    var comment_card = "<div class='card my-4 shadow-sm border-0'>" + card_body + card_footer + "</div>"
    return comment_card
}

function display_comment(restaurant_db) {
    const user_ratings = restaurant_db.user_ratings
    console.log(user_ratings)
    for (var key of Object.keys(user_ratings)) {
        $("#comment-list").prepend(comment_format(user_ratings[key]))
    }
}

function display_rating_page(rest_db) {
    $(".rstrnt-name").text(rest_db.name)

    //Display rating star
    const rating = rest_db.rating
    $(".rstrnt-overall").html(generate_star(rating.overall, 36))
    $(".rstrnt-facility").html(generate_star(rating.facility, 24))
    $(".rstrnt-access").html(generate_star(rating.accessibility, 24))
    $(".rstrnt-safety").html(generate_star(rating.safety, 24))

    //Display restaurant info
    $("#phone").text(rest_db.phone)
    $("#tel").text(rest_db.tel)
    $("#website").text(rest_db.site)

    //Display individual rating
    display_comment(rest_db)
}

function generate_star(num, size=24) {
    var star_html = ""
    for (i = 0; i < num; i++) {
        star_html += "<img src='../icons/star-fill.svg' width='"+size+"' height='"+size+"'></img>\n"
    }
    return star_html
}

async function insert_new_comment(rest_key, new_comment) {
    try {
        const ref = firebase.database().ref("restaurant/"+rest_key).child("user_ratings")
        await ref.push(new_comment)
    }
    catch(error) {
        console.log(error)
    }
}
