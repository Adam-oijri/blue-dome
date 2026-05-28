<?php

namespace App\Exceptions;

use RuntimeException;

class NotImplementedException extends RuntimeException
{
    public static function forGateway(string $gateway): self
    {
        return new self("The {$gateway} payment gateway is not implemented yet.");
    }
}
