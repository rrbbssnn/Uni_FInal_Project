$(window).ready(function () {
    $.ajax('/api/emotion', {
        method: 'GET',
        success: function (data) {
            var datapoints = [];
            data['data'].forEach(function (p) {
                datapoints.push({'label': p['Name'], 'y': p['Count']});
            });
            var chart = new CanvasJS.Chart("chartContainer",
                {
                    animationEnabled: true,
                    title: {
                        text: "What do others feel?"
                    },
                    data: [
                        {
                            type: "column", //change type to bar, line, area, pie, etc
                            dataPoints: datapoints
                        }
                    ]
                });
            chart.render();
        }
    });
});

$('#deletePlaylist').on('click', function () {
    var selectedPlaylistId = $('select[name=listPlaylist]').val();
    $.ajax({
        url: '/api/playlist/' + selectedPlaylistId,
        method: "DELETE",
        success: function () {
            $("#listPlayList option[value=selectedPlaylistId]").remove();
            window.location = '/user';
        }
    });
});

$('#editPlaylist').on('click', function () {
     $("#searchResult").text('');
    $("#plist").text('');
    var playlistId = $('select[name=listPlaylist]').val();
    $.ajax({
        url: '/api/getplaylist/' + playlistId,
        method: "GET",
        success: function (data) {
            $('#playlistName').val(data['data']['name']);
            $('#playlistId').val(data['data']['id']);
            $('#playlistDesc').val(data['data']['description']);

            var tracks = data['data']['tracks'];
            if (tracks !== null) {
                for (var j = 0; j < tracks.length; j++) {
                    SC.resolve(tracks[j].url).then(function (track) {
                        var duration = Math.floor(track.duration / 1000);
                        var li = $("<li></li>");
                        $('#plist').append(li);
                        var dropbtn = $("<button type='button' id='dropBtn'></button>");
                        dropbtn.attr("style", "border: none; height: 18px; width: 18px; background-size: 100%; background-color: transparent; background-image: url(/static/images/DropTrackIcon.png); background-repeat: no-repeat;background-position: center;");
                        var a = $("<a></a>");
                        li.append(dropbtn);
                        li.append(a);
                        a.attr('href', track.permalink_url);
                        a.text(updateTime(duration) + " - " + track.title + " - " + track.user.username);
                        (function (a) {
                            a.on('click', function (event) {
                                event.preventDefault();
                                playTrack(a.attr('href'));
                            })
                        }(a));
                        (function (li) {
                            dropbtn.bind('click', function (event) {
                                event.preventDefault();
                                li.remove();
                            })
                        }(li));
                    });
                }
            }
        }
    });
});


$('#saveBtn').on('click', function () {
    var playlistId = $('#playlistId').val();
    var tracks = new Array();
    var plist = document.getElementById('plist');
    if (plist.hasChildNodes()) {
        for (var i = 0; i < plist.children.length; i++) {
            var url = plist.children[i].children[1].href;
            var info = plist.children[i].children[1].textContent;
            var sub = info.split(" - ");
            var tTitle = sub[1];
            for (var j = 1; j < sub.length - 1; j++) {
                if (j == sub.length - 2)
                    break;
                else
                    tTitle = tTitle + " - " + sub[j + 1];
            }
            var track = new Object();
            track.title = tTitle;
            track.author = sub[sub.length - 1];
            track.url = url;
            tracks.push(track);
        }
    }
    if (playlistId == "")
        playlistId = "0";
    $.ajax({
        method: "POST",
        url: "/api/updateplaylist/" + playlistId,
        contentType: "application/json",
        dataType: 'json',
        processData: false,
        data: JSON.stringify({
            "id": playlistId,
            "name": $('#playlistName').val(),
            "description": $('#playlistDesc').val(),
            "tracks": JSON.stringify(tracks)
        }),
        success: function () {
            window.location = '/user';
        }
    });
});
