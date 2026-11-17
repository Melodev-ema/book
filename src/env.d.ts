/// <reference types="astro/client" />

declare namespace App {
    interface Locals {
        user: import('~/server/utils/session').SessionUser | null;
    }
}
