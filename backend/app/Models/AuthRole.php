<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuthRole extends Model
{
    protected $table = 'auth_roles';

    protected $fillable = [
        'name',
        'slug',
        'redirect_path',
        'description',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'role_id');
    }
}