<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Track extends Model
{
    protected $visible = [
        'id', 'uri', 'link', 'title', 'artist', 'album', 'type', 'duration'
    ];
}
