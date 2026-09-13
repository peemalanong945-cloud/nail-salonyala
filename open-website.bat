@echo off
title Nail & Salon - Web Server
cd /d "%~dp0"
echo ============================================
echo   Nail & Salon  |  http://localhost:4000
echo   ปิดหน้านี้เมื่อเลิกใช้ (อย่าลืม save ข้อมูล)
echo ============================================
start "" http://localhost:4000
npm run server