-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 19, 2026 at 08:53 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `whatsapp_crm`
--

-- --------------------------------------------------------

--
-- Table structure for table `auditlog`
--

CREATE TABLE `auditlog` (
  `id` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `entityType` varchar(191) DEFAULT NULL,
  `entityId` varchar(191) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `ipAddress` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `userId` varchar(191) DEFAULT NULL,
  `actorRole` varchar(191) DEFAULT NULL,
  `organizationId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auditlog`
--

INSERT INTO `auditlog` (`id`, `action`, `entityType`, `entityId`, `metadata`, `ipAddress`, `createdAt`, `userId`, `actorRole`, `organizationId`) VALUES
('cmsyx4vjl0005dcqm39dork0c', 'organization.create', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 17:10:20.337', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyx77eo0009dcqm11cht02f', 'plan.create', 'Plan', 'cmsyx77el0008dcqm41yz6qqm', NULL, '::1', '2026-08-18 17:12:09.024', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyx7o88000bdcqmeo4yspc7', 'plan.create', 'Plan', 'cmsyx7o84000adcqm6ipfrxsb', NULL, '::1', '2026-08-18 17:12:30.824', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyx7v47000cdcqmld2hqpnu', 'organization.impersonate', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 17:12:39.751', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyx8rcf000ddcqm5in08gtl', 'organization.update', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 17:13:21.519', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyx8wcj000edcqm62pbywc3', 'organization.update', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 17:13:28.003', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyx95ux000jdcqmij27okh8', 'organization.update', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 17:13:40.329', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyx965s000kdcqm8523m68x', 'organization.update', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 17:13:40.720', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyx98up000ldcqmplp3gqg8', 'organization.modules_update', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 17:13:44.209', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyx9aaf000mdcqmc3hpy7d6', 'organization.modules_update', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 17:13:46.071', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyximhg0002ckqml6sk0cf1', 'user.create', 'User', 'cmsyximh30001ckqmug61ph0i', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:01.780', NULL, NULL, NULL),
('cmsyximj30003ckqmk1s3v75c', 'user.update', 'User', 'cmsyximh30001ckqmug61ph0i', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:01.839', NULL, NULL, NULL),
('cmsyximmq000ehkqmd4bbx0yn', 'campaign.launch', 'Campaign', 'cmsyximiw0009hkqmzd8sz90p', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:01.970', NULL, NULL, NULL),
('cmsyximtp0004ckqmw51k67jz', 'user.password_reset', 'User', 'cmsyximh30001ckqmug61ph0i', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:02.221', NULL, NULL, NULL),
('cmsyxin3f0006ckqmz7c6xhzo', 'user.update', 'User', 'cmsyximh30001ckqmug61ph0i', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:02.571', NULL, NULL, NULL),
('cmsyxin4y0007ckqmozeedast', 'user.delete', 'User', 'cmsyximh30001ckqmug61ph0i', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:02.626', NULL, NULL, NULL),
('cmsyxin510003ccqmj2n9yai7', 'user.create', 'User', 'cmsyxin4i0002ccqm38twcyl8', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:02.629', NULL, NULL, NULL),
('cmsyxin6s0009ckqmknhn9etd', 'role.create', 'Role', 'cmsyxin6e0008ckqms1rx0tgb', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:02.692', NULL, NULL, NULL),
('cmsyxin8h000ackqmrwzws1ol', 'role.update', 'Role', 'cmsyxin6e0008ckqms1rx0tgb', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:02.753', NULL, NULL, NULL),
('cmsyxin8r0005foqm63zganh9', 'user.create', 'User', 'cmsyxin8e0004foqmz2ssv4w8', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:02.763', NULL, NULL, NULL),
('cmsyxin9g000bckqmxfygbna8', 'role.delete', 'Role', 'cmsyxin6e0008ckqms1rx0tgb', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:02.788', NULL, NULL, NULL),
('cmsyxin9x000cckqmsgghuonk', 'setting.update', 'SystemSetting', 'e2e.test.1787073658949', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:02.805', NULL, NULL, NULL),
('cmsyxinsn0006fsqm2dk6sgl9', 'organization.create', 'Organization', 'cmsyxins40004fsqmdbia49bs', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:03.479', NULL, NULL, NULL),
('cmsyxio11000a78qmtp2evxx4', 'organization.credits_adjust', 'CreditWallet', 'cmsyxinz4000778qmulkhe6t8', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:03.781', NULL, NULL, NULL),
('cmsyxio3n000d78qmnh3crshn', 'organization.credits_adjust', 'CreditWallet', 'cmsyxinzf000878qmg32i3hwv', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:03.875', NULL, NULL, NULL),
('cmsyxio6r000afsqmrszywkup', 'organization.update', 'Organization', 'cmsyxins40004fsqmdbia49bs', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:03.987', NULL, NULL, NULL),
('cmsyxio7o000bfsqmuty61ucp', 'organization.modules_update', 'Organization', 'cmsyxins40004fsqmdbia49bs', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:04.020', NULL, NULL, NULL),
('cmsyxio87000cfsqm0omjht2z', 'organization.modules_update', 'Organization', 'cmsyxins40004fsqmdbia49bs', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:04.039', NULL, NULL, NULL),
('cmsyxio8n000dfsqmta3qyb7s', 'organization.service_toggle', 'Organization', 'cmsyxins40004fsqmdbia49bs', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:04.055', NULL, NULL, NULL),
('cmsyxio9c000efsqmm5mcfsnn', 'organization.impersonate', 'Organization', 'cmsyxins40004fsqmdbia49bs', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:04.080', NULL, NULL, NULL),
('cmsyxioam000ffsqmdd57fjm0', 'organization.service_toggle', 'Organization', 'cmsyxins40004fsqmdbia49bs', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:04.126', NULL, NULL, NULL),
('cmsyxiob7000gfsqmad6bukhw', 'organization.impersonate', 'Organization', 'cmsyxins40004fsqmdbia49bs', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:04.147', NULL, NULL, NULL),
('cmsyxip7h000kfsqm36ey9ljp', 'organization.user_password_reset', 'Organization', 'cmsyxins40004fsqmdbia49bs', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:05.309', NULL, NULL, NULL),
('cmsyxipgi000mfsqml0kxpib6', 'organization.suspend', 'Organization', 'cmsyxins40004fsqmdbia49bs', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:05.634', NULL, NULL, NULL),
('cmsyxiph4000nfsqm8tr7fl4j', 'organization.impersonate', 'Organization', 'cmsyxins40004fsqmdbia49bs', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:05.656', NULL, NULL, NULL),
('cmsyxipho000ofsqmhytc3h3h', 'organization.activate', 'Organization', 'cmsyxins40004fsqmdbia49bs', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:05.676', NULL, NULL, NULL),
('cmsyxipro000ufsqmnlkp7x5s', 'organization.create', 'Organization', 'cmsyxipqx000qfsqmdtdip8xi', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:06.036', NULL, NULL, NULL),
('cmsyxipt8000vfsqm4frzn9ih', 'organization.update', 'Organization', 'cmsyxipqx000qfsqmdtdip8xi', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:06.093', NULL, NULL, NULL),
('cmsyxipu7000wfsqmfzk48f2e', 'organization.update', 'Organization', 'cmsyxipqx000qfsqmdtdip8xi', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:06.127', NULL, NULL, NULL),
('cmsyxipvm000zfsqmhxevc89g', 'organization.update', 'Organization', 'cmsyxipqx000qfsqmdtdip8xi', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:06.178', NULL, NULL, NULL),
('cmsyxipym0006twqmh2f3x8er', 'organization.credits_adjust', 'CreditWallet', 'cmsyxipx00004twqm8o9jmf91', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:06.286', NULL, NULL, NULL),
('cmsyxiq0i0008twqm0ujqb67m', 'organization.credits_adjust', 'CreditWallet', 'cmsyxipx00004twqm8o9jmf91', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:06.354', NULL, NULL, NULL),
('cmsyxitk8000fhkqm8qsmi2sm', 'campaign.retry_failed', 'Campaign', 'cmsyximiw0009hkqmzd8sz90p', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:10.952', NULL, NULL, NULL),
('cmsyxiwi0000bj8qm73sn2kz5', 'organization.credits_adjust', 'CreditWallet', 'cmsyxiwf60009j8qm2h9m2mgw', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:14.760', NULL, NULL, NULL),
('cmsyxiwid0006qgqm01c52nki', 'organization.credits_adjust', 'CreditWallet', 'cmsyxiwhu0004qgqmoyvb2esl', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:14.773', NULL, NULL, NULL),
('cmsyxiwqx00085cqm7eiwu4er', 'automation.create', 'Automation', 'cmsyxiwql00075cqm2jq859po', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:15.081', NULL, NULL, NULL),
('cmsyxiwrl0008qgqmruduvzvc', 'user.create', 'User', 'cmsyxiwrc0007qgqm7q1msvcv', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:15.105', NULL, NULL, NULL),
('cmsyxiwy2000e5cqm4l14n7am', 'automation.create', 'Automation', 'cmsyxiwxw000d5cqm0n5foj9z', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:15.338', NULL, NULL, NULL),
('cmsyxiwzu0004kgqmv1wxasrf', 'user.create', 'User', 'cmsyxiwzk0003kgqmoda5cfn2', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:15.402', NULL, NULL, NULL),
('cmsyxix1k000g5cqmx6gwv1lw', 'automation.update', 'Automation', 'cmsyxiwql00075cqm2jq859po', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:15.464', NULL, NULL, NULL),
('cmsyxix1w000h5cqmtifttirm', 'automation.delete', 'Automation', 'cmsyxiwql00075cqm2jq859po', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:15.476', NULL, NULL, NULL),
('cmsyxixc20005vwqmnsoomqx5', 'plan.create', 'Plan', 'cmsyxixbp0004vwqm5pz0agge', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:15.842', NULL, NULL, NULL),
('cmsyxixdm0006vwqmxcxb1kx1', 'plan.update', 'Plan', 'cmsyxixbp0004vwqm5pz0agge', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:15.898', NULL, NULL, NULL),
('cmsyxixt3000avwqmp6rugzlp', 'plan.delete', 'Plan', 'cmsyxixbp0004vwqm5pz0agge', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:16.455', NULL, NULL, NULL),
('cmsyxizud000khkqmn00ml3ds', 'campaign.launch', 'Campaign', 'cmsyxizte000ghkqm2hzlilug', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:19.093', NULL, NULL, NULL),
('cmsyxizut000lhkqmx0uldz3r', 'campaign.pause', 'Campaign', 'cmsyxizte000ghkqm2hzlilug', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:19.109', NULL, NULL, NULL),
('cmsyxizv6000mhkqm5npoyd6u', 'campaign.resume', 'Campaign', 'cmsyxizte000ghkqm2hzlilug', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:19.122', NULL, NULL, NULL),
('cmsyxj1oj000rhkqm0v7u9yrl', 'campaign.launch', 'Campaign', 'cmsyxj1o0000nhkqm77jalkl3', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:21.475', NULL, NULL, NULL),
('cmsyxj1ov000shkqmwd6roe0y', 'campaign.cancel', 'Campaign', 'cmsyxj1o0000nhkqm77jalkl3', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:21.487', NULL, NULL, NULL),
('cmsyxj1pd000vhkqmz4nidj3w', 'campaign.launch', 'Campaign', 'cmsyxj1oy000thkqmz6plfoox', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:21.505', NULL, NULL, NULL),
('cmsyxj1pw000whkqm7784u70a', 'campaign.emergency_stop', NULL, NULL, NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:21.524', NULL, NULL, NULL),
('cmsyxjg11000ezoqmqhcg42vt', 'campaign.launch', 'Campaign', 'cmsyxjfy90009zoqmuyrwrc1r', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:40.069', NULL, NULL, NULL),
('cmsyxjhua000fzoqmhbqh1hhz', 'campaign.retry_failed', 'Campaign', 'cmsyxjfy90009zoqmuyrwrc1r', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:42.418', NULL, NULL, NULL),
('cmsyxjk5g000kzoqmcy8kh2qm', 'campaign.launch', 'Campaign', 'cmsyxjk4r000gzoqm7z7y5lo3', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:45.412', NULL, NULL, NULL),
('cmsyxjk5r000lzoqmb4m0yyja', 'campaign.pause', 'Campaign', 'cmsyxjk4r000gzoqm7z7y5lo3', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:45.423', NULL, NULL, NULL),
('cmsyxjk5y000mzoqmonkuz8mv', 'campaign.resume', 'Campaign', 'cmsyxjk4r000gzoqm7z7y5lo3', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:45.430', NULL, NULL, NULL),
('cmsyxjmkz000rzoqm35wdlhde', 'campaign.launch', 'Campaign', 'cmsyxjmkg000nzoqmm3l2hivy', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:48.563', NULL, NULL, NULL),
('cmsyxjml8000szoqm9k0y8i8g', 'campaign.cancel', 'Campaign', 'cmsyxjmkg000nzoqmm3l2hivy', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:48.572', NULL, NULL, NULL),
('cmsyxjmlr000vzoqmnpsqmvu1', 'campaign.launch', 'Campaign', 'cmsyxjmld000tzoqm4ve7e4j2', NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:48.591', NULL, NULL, NULL),
('cmsyxjmm1000wzoqm7rbpix55', 'campaign.emergency_stop', NULL, NULL, NULL, '::ffff:127.0.0.1', '2026-08-18 17:21:48.601', NULL, NULL, NULL),
('cmsyxlelg0002j8qm10ku5zk3', 'organization.update', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 17:23:11.524', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyxlemu0004j8qmqw596436', 'organization.update', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 17:23:11.574', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyyww4w00042oqm4otsnf1h', 'user.create', 'User', 'cmsyyww4r00032oqm84hmv5lc', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:07.088', NULL, NULL, NULL),
('cmsyywxdo00052oqmeb985u23', 'user.create', 'User', 'cmsyywxdk00042oqm5ti1hwdj', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:08.700', NULL, NULL, NULL),
('cmsyywxq800092oqmrziipwd1', 'user.create', 'User', 'cmsyywxq400082oqmo5gu8hj6', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:09.152', NULL, NULL, NULL),
('cmsyywykp000e2oqmhowwfsj4', 'campaign.launch', 'Campaign', 'cmsyywyjm00092oqmh41l5ssk', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:10.249', NULL, NULL, NULL),
('cmsyywz2s000k2oqm612lvmql', 'campaign.launch', 'Campaign', 'cmsyywz2f000g2oqm973c4mt3', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:10.900', NULL, NULL, NULL),
('cmsyyx01x000p2oqm3o25s5jm', 'campaign.launch', 'Campaign', 'cmsyyx01k000l2oqm04psybjd', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:12.165', NULL, NULL, NULL),
('cmsyyx025000q2oqm95f7r5ep', 'campaign.pause', 'Campaign', 'cmsyyx01k000l2oqm04psybjd', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:12.173', NULL, NULL, NULL),
('cmsyyx02c000r2oqmqo4dpxrr', 'campaign.resume', 'Campaign', 'cmsyyx01k000l2oqm04psybjd', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:12.180', NULL, NULL, NULL),
('cmsyyx0kc000w2oqmpgqumc0k', 'campaign.launch', 'Campaign', 'cmsyyx0jx000s2oqmxpp8oguu', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:12.828', NULL, NULL, NULL),
('cmsyyx0kk000x2oqm2xly3nkz', 'campaign.cancel', 'Campaign', 'cmsyyx0jx000s2oqmxpp8oguu', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:12.836', NULL, NULL, NULL),
('cmsyyx0l500102oqmmxv65ncp', 'campaign.launch', 'Campaign', 'cmsyyx0kt000y2oqmv7441yzf', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:12.857', NULL, NULL, NULL),
('cmsyyx0lc00112oqm45zn55lb', 'campaign.emergency_stop', NULL, NULL, NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:12.864', NULL, NULL, NULL),
('cmsyyxi580005ccqmus0rjid5', 'user.create', 'User', 'cmsyyxi530004ccqms4asf1uq', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:35.612', NULL, NULL, NULL),
('cmsyyxihy0009ccqm44kalrq5', 'user.create', 'User', 'cmsyyxihu0008ccqmr6mxhe1w', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:36.070', NULL, NULL, NULL),
('cmsyyxqqv0005h0qmvswre5fs', 'plan.create', 'Plan', 'cmsyyxqqn0004h0qmj8s6xsu1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:46.759', NULL, NULL, NULL),
('cmsyyxqrg0006h0qm0idy1bwk', 'plan.update', 'Plan', 'cmsyyxqqn0004h0qmj8s6xsu1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:46.780', NULL, NULL, NULL),
('cmsyyxr3d000ah0qmptzubghd', 'plan.delete', 'Plan', 'cmsyyxqqn0004h0qmj8s6xsu1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:47.209', NULL, NULL, NULL),
('cmsyyxtr30008h0qmn3cm1qlh', 'automation.create', 'Automation', 'cmsyyxtqz0007h0qma16slpr0', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:50.655', NULL, NULL, NULL),
('cmsyyxtxo000eh0qms93h0h2d', 'automation.create', 'Automation', 'cmsyyxtxk000dh0qm515ptrht', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:50.892', NULL, NULL, NULL),
('cmsyyxu0x000gh0qmdmcmwj7z', 'automation.update', 'Automation', 'cmsyyxtqz0007h0qma16slpr0', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:51.009', NULL, NULL, NULL),
('cmsyyxu12000hh0qmbivanal7', 'automation.delete', 'Automation', 'cmsyyxtqz0007h0qma16slpr0', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:51.014', NULL, NULL, NULL),
('cmsyyxusw0006h0qmyefwutst', 'organization.credits_adjust', 'CreditWallet', 'cmsyyxuso0004h0qm5399yglx', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:52.016', NULL, NULL, NULL),
('cmsyyxuz30008h0qmrlou563d', 'user.create', 'User', 'cmsyyxuyy0007h0qmgvens3ch', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:52.239', NULL, NULL, NULL),
('cmsyyxvrm000bh0qm0tvbfot6', 'organization.credits_adjust', 'CreditWallet', 'cmsyyxvqr0009h0qm6nxmbo3h', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:53.266', NULL, NULL, NULL),
('cmsyyxy4g0006h0qmnf23u0gb', 'organization.create', 'Organization', 'cmsyyxy4b0004h0qmq5k7hcm1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:56.320', NULL, NULL, NULL),
('cmsyyxyc0000ah0qmtf5wvbox', 'organization.update', 'Organization', 'cmsyyxy4b0004h0qmq5k7hcm1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:56.592', NULL, NULL, NULL),
('cmsyyxyc7000bh0qm6rwosqh6', 'organization.modules_update', 'Organization', 'cmsyyxy4b0004h0qmq5k7hcm1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:56.599', NULL, NULL, NULL),
('cmsyyxycd000ch0qmjr79cpv1', 'organization.modules_update', 'Organization', 'cmsyyxy4b0004h0qmq5k7hcm1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:56.605', NULL, NULL, NULL),
('cmsyyxyck000dh0qmvq7soqyb', 'organization.service_toggle', 'Organization', 'cmsyyxy4b0004h0qmq5k7hcm1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:56.612', NULL, NULL, NULL),
('cmsyyxycq000eh0qm84i2guzt', 'organization.impersonate', 'Organization', 'cmsyyxy4b0004h0qmq5k7hcm1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:56.618', NULL, NULL, NULL),
('cmsyyxyd2000fh0qmcp2mkaa0', 'organization.service_toggle', 'Organization', 'cmsyyxy4b0004h0qmq5k7hcm1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:56.630', NULL, NULL, NULL),
('cmsyyxyd8000gh0qmm3cbz5p3', 'organization.impersonate', 'Organization', 'cmsyyxy4b0004h0qmq5k7hcm1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:56.636', NULL, NULL, NULL),
('cmsyyxyuk000kh0qmf8lvftyp', 'organization.user_password_reset', 'Organization', 'cmsyyxy4b0004h0qmq5k7hcm1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:57.260', NULL, NULL, NULL),
('cmsyyxz0d000mh0qmy7yyrpcv', 'organization.suspend', 'Organization', 'cmsyyxy4b0004h0qmq5k7hcm1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:57.469', NULL, NULL, NULL),
('cmsyyxz0j000nh0qm5gdeeem7', 'organization.impersonate', 'Organization', 'cmsyyxy4b0004h0qmq5k7hcm1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:57.475', NULL, NULL, NULL),
('cmsyyxz0r000oh0qm03tvk0z3', 'organization.activate', 'Organization', 'cmsyyxy4b0004h0qmq5k7hcm1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:57.483', NULL, NULL, NULL),
('cmsyyxz6x000uh0qmsthwnkmt', 'organization.create', 'Organization', 'cmsyyxz6n000qh0qm607wmrgh', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:57.705', NULL, NULL, NULL),
('cmsyyxz7h000vh0qmlicgp0so', 'organization.update', 'Organization', 'cmsyyxz6n000qh0qm607wmrgh', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:57.725', NULL, NULL, NULL),
('cmsyyxz7r000wh0qm056isp60', 'organization.update', 'Organization', 'cmsyyxz6n000qh0qm607wmrgh', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:57.735', NULL, NULL, NULL),
('cmsyyxz87000zh0qmcutp1j4u', 'organization.update', 'Organization', 'cmsyyxz6n000qh0qm607wmrgh', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:57.751', NULL, NULL, NULL),
('cmsyyy0ab000ah0qm63d6fgj2', 'organization.credits_adjust', 'CreditWallet', 'cmsyyy09u0007h0qmhdrghub6', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:59.123', NULL, NULL, NULL),
('cmsyyy0b7000dh0qmlktsgcm5', 'organization.credits_adjust', 'CreditWallet', 'cmsyyy09y0008h0qm0rf6eij8', NULL, '::ffff:127.0.0.1', '2026-08-18 18:00:59.155', NULL, NULL, NULL),
('cmsyyy1cg0003h0qmkm2z5kvj', 'user.create', 'User', 'cmsyyy1cb0002h0qmy2w7bifa', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:00.496', NULL, NULL, NULL),
('cmsyyy3gr0002h0qmv9nqa8sm', 'user.create', 'User', 'cmsyyy3gn0001h0qmlzbx1tvk', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:03.243', NULL, NULL, NULL),
('cmsyyy3h20003h0qmm60pgghs', 'user.update', 'User', 'cmsyyy3gn0001h0qmlzbx1tvk', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:03.254', NULL, NULL, NULL),
('cmsyyy3mq0004h0qmg3isk1ui', 'user.password_reset', 'User', 'cmsyyy3gn0001h0qmlzbx1tvk', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:03.458', NULL, NULL, NULL),
('cmsyyy3si0006h0qmic2jogly', 'user.update', 'User', 'cmsyyy3gn0001h0qmlzbx1tvk', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:03.666', NULL, NULL, NULL),
('cmsyyy3sw0007h0qmlw9nltgl', 'user.delete', 'User', 'cmsyyy3gn0001h0qmlzbx1tvk', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:03.680', NULL, NULL, NULL),
('cmsyyy3tc0009h0qm918spbqw', 'role.create', 'Role', 'cmsyyy3t80008h0qmf900cdds', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:03.696', NULL, NULL, NULL),
('cmsyyy3tn000ah0qm80iuqszw', 'role.update', 'Role', 'cmsyyy3t80008h0qmf900cdds', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:03.707', NULL, NULL, NULL),
('cmsyyy3tz000bh0qmqvjpluj2', 'role.delete', 'Role', 'cmsyyy3t80008h0qmf900cdds', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:03.719', NULL, NULL, NULL),
('cmsyyy3u4000ch0qmgk30u0ur', 'setting.update', 'SystemSetting', 'e2e.test.1787076062675', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:03.724', NULL, NULL, NULL),
('cmsyyy6fh0004h0qmh30hfxzj', 'user.create', 'User', 'cmsyyy6fd0003h0qmklht75c1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:07.085', NULL, NULL, NULL),
('cmsyyy7nc0005h0qm0ekgif5a', 'user.create', 'User', 'cmsyyy7n80004h0qmyoxvt4aw', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:08.664', NULL, NULL, NULL),
('cmsyyy7zo0009h0qmc4kzicr0', 'user.create', 'User', 'cmsyyy7zk0008h0qmtyb5x0fc', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:09.108', NULL, NULL, NULL),
('cmsyyy8wh0006h0qmvzviam85', 'organization.credits_adjust', 'CreditWallet', 'cmsyyy8w00004h0qmepdkvb1q', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:10.289', NULL, NULL, NULL),
('cmsyyy8ww0008h0qmti73e30d', 'organization.credits_adjust', 'CreditWallet', 'cmsyyy8w00004h0qmepdkvb1q', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:10.304', NULL, NULL, NULL),
('cmsyyy9jo000eh0qm7fufuj70', 'campaign.launch', 'Campaign', 'cmsyyy9io0009h0qm7tx3433z', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:11.124', NULL, NULL, NULL),
('cmsyyy9xh000kh0qma3brz9ie', 'campaign.launch', 'Campaign', 'cmsyyy9x4000gh0qmf0gflzh7', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:11.621', NULL, NULL, NULL),
('cmsyyyas7000ph0qmevemil4g', 'campaign.launch', 'Campaign', 'cmsyyyaru000lh0qmaa9afnx1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:12.727', NULL, NULL, NULL),
('cmsyyyase000qh0qmnwe95nsa', 'campaign.pause', 'Campaign', 'cmsyyyaru000lh0qmaa9afnx1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:12.734', NULL, NULL, NULL),
('cmsyyyask000rh0qm1y2y52bg', 'campaign.resume', 'Campaign', 'cmsyyyaru000lh0qmaa9afnx1', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:12.740', NULL, NULL, NULL),
('cmsyyyber000wh0qmwipmgo3t', 'campaign.launch', 'Campaign', 'cmsyyybed000sh0qmwvmaj0tv', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:13.539', NULL, NULL, NULL),
('cmsyyybez000xh0qm2odoct5m', 'campaign.cancel', 'Campaign', 'cmsyyybed000sh0qmwvmaj0tv', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:13.547', NULL, NULL, NULL),
('cmsyyybfe0010h0qmm8waa79m', 'campaign.launch', 'Campaign', 'cmsyyybf3000yh0qmh9g8jndo', NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:13.562', NULL, NULL, NULL),
('cmsyyybfl0011h0qm4o6cnaf4', 'campaign.emergency_stop', NULL, NULL, NULL, '::ffff:127.0.0.1', '2026-08-18 18:01:13.569', NULL, NULL, NULL),
('cmsyzelxv0005scqmlxje2g9z', 'plan.create', 'Plan', 'cmsyzelxp0004scqm7n4tud1o', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:53.683', NULL, NULL, NULL),
('cmsyzelyg0006scqmll4mfitp', 'plan.update', 'Plan', 'cmsyzelxp0004scqm7n4tud1o', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:53.704', NULL, NULL, NULL),
('cmsyzemac000ascqmtb8ig8el', 'plan.delete', 'Plan', 'cmsyzelxp0004scqm7n4tud1o', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:54.132', NULL, NULL, NULL),
('cmsyzemwo000escqmgwxboo73', 'campaign.launch', 'Campaign', 'cmsyzemvf0009scqmz6vbcnm6', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:54.936', NULL, NULL, NULL),
('cmsyzenav000kscqmbp2wu9zp', 'campaign.launch', 'Campaign', 'cmsyzenah000gscqm8dv9wgkp', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:55.447', NULL, NULL, NULL),
('cmsyzeo5m000pscqmar6ozamz', 'campaign.launch', 'Campaign', 'cmsyzeo58000lscqmvci6bn5d', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:56.554', NULL, NULL, NULL),
('cmsyzeo5t000qscqmt75otb2g', 'campaign.pause', 'Campaign', 'cmsyzeo58000lscqmvci6bn5d', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:56.561', NULL, NULL, NULL),
('cmsyzeo5z000rscqm5gjlhpb3', 'campaign.resume', 'Campaign', 'cmsyzeo58000lscqmvci6bn5d', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:56.567', NULL, NULL, NULL),
('cmsyzeoff000wscqmo0byc4iz', 'campaign.launch', 'Campaign', 'cmsyzeoez000sscqmb0i9ks0z', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:56.907', NULL, NULL, NULL),
('cmsyzeofo000xscqmgx92imsk', 'campaign.cancel', 'Campaign', 'cmsyzeoez000sscqmb0i9ks0z', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:56.916', NULL, NULL, NULL),
('cmsyzeog70010scqmz4nco6k5', 'campaign.launch', 'Campaign', 'cmsyzeofu000yscqmwiagmiau', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:56.935', NULL, NULL, NULL),
('cmsyzeogf0011scqmvafy8f1v', 'campaign.emergency_stop', NULL, NULL, NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:56.943', NULL, NULL, NULL),
('cmsyzepde0006scqmx4n65ap4', 'organization.create', 'Organization', 'cmsyzepd80004scqmhxxzv4ve', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:58.130', NULL, NULL, NULL),
('cmsyzepl4000ascqmtc3jub02', 'organization.update', 'Organization', 'cmsyzepd80004scqmhxxzv4ve', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:58.408', NULL, NULL, NULL),
('cmsyzeplb000bscqmt2n0gsu0', 'organization.modules_update', 'Organization', 'cmsyzepd80004scqmhxxzv4ve', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:58.415', NULL, NULL, NULL),
('cmsyzeplh000cscqmm06v5olu', 'organization.modules_update', 'Organization', 'cmsyzepd80004scqmhxxzv4ve', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:58.421', NULL, NULL, NULL),
('cmsyzeplo000dscqmdk8d4x29', 'organization.service_toggle', 'Organization', 'cmsyzepd80004scqmhxxzv4ve', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:58.428', NULL, NULL, NULL),
('cmsyzeplu000escqmg9py359o', 'organization.impersonate', 'Organization', 'cmsyzepd80004scqmhxxzv4ve', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:58.434', NULL, NULL, NULL),
('cmsyzepm7000fscqmha5mmlpy', 'organization.service_toggle', 'Organization', 'cmsyzepd80004scqmhxxzv4ve', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:58.447', NULL, NULL, NULL),
('cmsyzepmc000gscqm7x8njehv', 'organization.impersonate', 'Organization', 'cmsyzepd80004scqmhxxzv4ve', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:58.452', NULL, NULL, NULL),
('cmsyzeq41000kscqmx9fapxn1', 'organization.user_password_reset', 'Organization', 'cmsyzepd80004scqmhxxzv4ve', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:59.089', NULL, NULL, NULL),
('cmsyzeq9y000mscqm6yzbl7ts', 'organization.suspend', 'Organization', 'cmsyzepd80004scqmhxxzv4ve', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:59.302', NULL, NULL, NULL),
('cmsyzeqa4000nscqm6ohh4rf2', 'organization.impersonate', 'Organization', 'cmsyzepd80004scqmhxxzv4ve', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:59.308', NULL, NULL, NULL),
('cmsyzeqac000oscqmrpvrs5ys', 'organization.activate', 'Organization', 'cmsyzepd80004scqmhxxzv4ve', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:59.316', NULL, NULL, NULL),
('cmsyzeqgi000uscqm2j8dow84', 'organization.create', 'Organization', 'cmsyzeqg9000qscqmrouktnce', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:59.538', NULL, NULL, NULL),
('cmsyzeqh0000vscqmg5h3fywv', 'organization.update', 'Organization', 'cmsyzeqg9000qscqmrouktnce', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:59.556', NULL, NULL, NULL),
('cmsyzeqha000wscqmfq3wbr5x', 'organization.update', 'Organization', 'cmsyzeqg9000qscqmrouktnce', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:59.566', NULL, NULL, NULL),
('cmsyzeqhw000zscqm10ebllzw', 'organization.update', 'Organization', 'cmsyzeqg9000qscqmrouktnce', NULL, '::ffff:127.0.0.1', '2026-08-18 18:13:59.588', NULL, NULL, NULL),
('cmsyzetek0005scqm6tfceao8', 'user.create', 'User', 'cmsyzetef0004scqmvdeq13ze', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:03.356', NULL, NULL, NULL),
('cmsyzetr10009scqm3nzznu4a', 'user.create', 'User', 'cmsyzetqx0008scqmlt4sx3fz', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:03.805', NULL, NULL, NULL),
('cmsyzeutf0003scqmwg216l3l', 'user.create', 'User', 'cmsyzeuta0002scqmazj9kba9', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:05.187', NULL, NULL, NULL),
('cmsyzexd8000ascqmd2w3ztf3', 'organization.credits_adjust', 'CreditWallet', 'cmsyzexcq0007scqmuhvave2y', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:08.492', NULL, NULL, NULL),
('cmsyzexe4000dscqm6uy8o513', 'organization.credits_adjust', 'CreditWallet', 'cmsyzexcu0008scqm5y79x5xh', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:08.524', NULL, NULL, NULL),
('cmsyzey2z0002scqmiy708xtu', 'user.create', 'User', 'cmsyzey2u0001scqmy4viwqs5', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:09.419', NULL, NULL, NULL),
('cmsyzey3a0003scqmznvi1trs', 'user.update', 'User', 'cmsyzey2u0001scqmy4viwqs5', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:09.430', NULL, NULL, NULL),
('cmsyzey8x0004scqmul4o4xvh', 'user.password_reset', 'User', 'cmsyzey2u0001scqmy4viwqs5', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:09.633', NULL, NULL, NULL),
('cmsyzeyeq0006scqmza0xrl10', 'user.update', 'User', 'cmsyzey2u0001scqmy4viwqs5', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:09.842', NULL, NULL, NULL),
('cmsyzeyf50007scqmcchcov9k', 'user.delete', 'User', 'cmsyzey2u0001scqmy4viwqs5', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:09.857', NULL, NULL, NULL),
('cmsyzeyg20009scqm6hohj6yj', 'role.create', 'Role', 'cmsyzeyfy0008scqm1o9gegm5', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:09.890', NULL, NULL, NULL),
('cmsyzeygd000ascqmr57w59n0', 'role.update', 'Role', 'cmsyzeyfy0008scqm1o9gegm5', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:09.901', NULL, NULL, NULL),
('cmsyzeygp000bscqm17w1sb6w', 'role.delete', 'Role', 'cmsyzeyfy0008scqm1o9gegm5', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:09.913', NULL, NULL, NULL),
('cmsyzeygu000cscqmynpbpx2u', 'setting.update', 'SystemSetting', 'e2e.test.1787076848881', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:09.918', NULL, NULL, NULL),
('cmsyzez6s0004scqm96japwh3', 'user.create', 'User', 'cmsyzez6l0003scqmyokls82q', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:10.852', NULL, NULL, NULL),
('cmsyzf07p0006scqm99sm5048', 'organization.credits_adjust', 'CreditWallet', 'cmsyzf07d0004scqm9bxm20fj', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:12.181', NULL, NULL, NULL),
('cmsyzf0dr0008scqmv96ts62b', 'user.create', 'User', 'cmsyzf0dm0007scqmzg5jpotn', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:12.399', NULL, NULL, NULL),
('cmsyzf0zw0008scqmmuidedw4', 'automation.create', 'Automation', 'cmsyzf0zs0007scqmbi9l2b6n', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:13.196', NULL, NULL, NULL),
('cmsyzf166000escqm9xi1s8pv', 'automation.create', 'Automation', 'cmsyzf164000dscqmo6piezk4', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:13.422', NULL, NULL, NULL),
('cmsyzf19l000gscqmirr4nfwq', 'automation.update', 'Automation', 'cmsyzf0zs0007scqmbi9l2b6n', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:13.545', NULL, NULL, NULL),
('cmsyzf19q000hscqm4vyzu6zy', 'automation.delete', 'Automation', 'cmsyzf0zs0007scqmbi9l2b6n', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:13.550', NULL, NULL, NULL),
('cmsyzf21e000bscqmiqcliz4q', 'organization.credits_adjust', 'CreditWallet', 'cmsyzf2080009scqm9qga0y1o', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:14.546', NULL, NULL, NULL),
('cmsyzf2vv0006scqm1qf6xua0', 'organization.credits_adjust', 'CreditWallet', 'cmsyzf2vf0004scqmn93ndzmy', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:15.643', NULL, NULL, NULL),
('cmsyzf2wb0008scqmf38ob03w', 'organization.credits_adjust', 'CreditWallet', 'cmsyzf2vf0004scqmn93ndzmy', NULL, '::ffff:127.0.0.1', '2026-08-18 18:14:15.659', NULL, NULL, NULL),
('cmsyzhtm8000josqmaboa7exv', 'organization.impersonate', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 18:16:23.600', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyziw12000posqml96ytuge', 'organization.impersonate', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 18:17:13.382', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyzjtdc000uosqmuoarsmrl', 'whatsapp.connect', 'WhatsAppAccount', 'cmsyzjt6f000sosqmvxiomj5m', NULL, '::1', '2026-08-18 18:17:56.592', 'cmsyx4vjg0004dcqmxk4wp1mx', NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzmvqn0013osqmu5w9nawy', 'campaign.launch', 'Campaign', 'cmsyzkqop000vosqmfsnecpvi', NULL, '::1', '2026-08-18 18:20:19.631', 'cmsyx4vjg0004dcqmxk4wp1mx', NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzse9e001eosqm7x0ec3qq', 'campaign.launch', 'Campaign', 'cmsyzs98e001bosqmwm28fbpr', NULL, '::1', '2026-08-18 18:24:36.914', 'cmsyx4vjg0004dcqmxk4wp1mx', NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzsja5001mosqm9c0l3nd9', 'organization.impersonate', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 18:24:43.421', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyzsq9e001oosqm93eh5xdu', 'organization.impersonate', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 18:24:52.466', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsyzvfo5001vosqmckvuxf1m', 'organization.update', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 18:26:58.709', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsz01z36000e9wqmdjkr4ykx', 'campaign.launch', 'Campaign', 'cmsz01z1h00099wqm2cnyja2v', NULL, '::ffff:127.0.0.1', '2026-08-18 18:32:03.810', NULL, NULL, NULL),
('cmsz01z8w000l9wqmceev2o4r', 'campaign.relaunch', 'Campaign', 'cmsz01z8l000g9wqmxoas4hum', NULL, '::ffff:127.0.0.1', '2026-08-18 18:32:04.016', NULL, NULL, NULL),
('cmsz01ze7000r9wqmvopsraam', 'campaign.launch', 'Campaign', 'cmsz01zdl000n9wqm0vysygzv', NULL, '::ffff:127.0.0.1', '2026-08-18 18:32:04.207', NULL, NULL, NULL),
('cmsz0209m000w9wqm7xafoofr', 'campaign.launch', 'Campaign', 'cmsz02098000s9wqmtndqkx5e', NULL, '::ffff:127.0.0.1', '2026-08-18 18:32:05.338', NULL, NULL, NULL),
('cmsz0209t000x9wqmm32ukx79', 'campaign.pause', 'Campaign', 'cmsz02098000s9wqmtndqkx5e', NULL, '::ffff:127.0.0.1', '2026-08-18 18:32:05.345', NULL, NULL, NULL),
('cmsz020a0000y9wqmnejydhsf', 'campaign.resume', 'Campaign', 'cmsz02098000s9wqmtndqkx5e', NULL, '::ffff:127.0.0.1', '2026-08-18 18:32:05.352', NULL, NULL, NULL),
('cmsz020jg00139wqmb2f4ktqu', 'campaign.launch', 'Campaign', 'cmsz020j0000z9wqm6x5t04ax', NULL, '::ffff:127.0.0.1', '2026-08-18 18:32:05.692', NULL, NULL, NULL),
('cmsz020jo00149wqmphyirdbp', 'campaign.cancel', 'Campaign', 'cmsz020j0000z9wqm6x5t04ax', NULL, '::ffff:127.0.0.1', '2026-08-18 18:32:05.700', NULL, NULL, NULL),
('cmsz020k400179wqm1w4xgrgi', 'campaign.launch', 'Campaign', 'cmsz020jt00159wqmvfludo6l', NULL, '::ffff:127.0.0.1', '2026-08-18 18:32:05.716', NULL, NULL, NULL),
('cmsz020kc00189wqmac2on857', 'campaign.emergency_stop', NULL, NULL, NULL, '::ffff:127.0.0.1', '2026-08-18 18:32:05.724', NULL, NULL, NULL),
('cmsz028z8002wosqmzsfu6jvf', 'organization.impersonate', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 18:32:16.628', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsz03nih0001ooqm86q9d782', 'organization.impersonate', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-18 18:33:22.121', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsz03nl60005ooqme11w2dm5', 'campaign.relaunch', 'Campaign', 'cmsz03nkk0002ooqm7rppzl64', NULL, '::1', '2026-08-18 18:33:22.218', 'cmsyx4vjg0004dcqmxk4wp1mx', NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsz058id000booqmaswfaiym', 'campaign.relaunch', 'Campaign', 'cmsz058hr0008ooqmrjsy3pql', NULL, '::1', '2026-08-18 18:34:35.989', 'cmsyx4vjg0004dcqmxk4wp1mx', NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsznq3xi0003dcqmpcn9ikeo', 'organization.impersonate', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-19 05:34:40.998', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmsznqz5v0006agqmq6bi0kvk', 'organization.credits_adjust', 'CreditWallet', 'cmsznqz4b0004agqmqk0hnrgw', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:21.476', NULL, NULL, NULL),
('cmsznqz770008agqm3gldty6j', 'organization.credits_adjust', 'CreditWallet', 'cmsznqz4b0004agqmqk0hnrgw', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:21.523', NULL, NULL, NULL),
('cmsznr0fk000bagqmuttfqn60', 'organization.credits_adjust', 'CreditWallet', 'cmsznr0de0009agqmdavkhs6r', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:23.120', NULL, NULL, NULL),
('cmsznr2ss0005agqm38ta871m', 'user.create', 'User', 'cmsznr2so0004agqmmv093uuq', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:26.188', NULL, NULL, NULL),
('cmsznr2yt0007agqmdddpgobl', 'user.create', 'User', 'cmsznr2yq0006agqm0m1j5bdr', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:26.405', NULL, NULL, NULL),
('cmsznr2z90008agqm8m4uetoi', 'user.update', 'User', 'cmsznr2av0001agqm01yy5yfz', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:26.421', NULL, NULL, NULL),
('cmsznr3o4000eagqmrldmaj6v', 'campaign.launch', 'Campaign', 'cmsznr3mz0009agqm7ugrfsss', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:27.316', NULL, NULL, NULL),
('cmsznr3ts000lagqm9nac0ow7', 'campaign.relaunch', 'Campaign', 'cmsznr3tj000gagqm5pa2szb1', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:27.520', NULL, NULL, NULL),
('cmsznr436000ragqmc480zvld', 'campaign.launch', 'Campaign', 'cmsznr42l000nagqmv5dij6u0', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:27.858', NULL, NULL, NULL),
('cmsznr4xy000wagqm20k6jb5e', 'campaign.launch', 'Campaign', 'cmsznr4xl000sagqmlvoy7mmo', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:28.966', NULL, NULL, NULL),
('cmsznr4y6000xagqm7yqlaem0', 'campaign.pause', 'Campaign', 'cmsznr4xl000sagqmlvoy7mmo', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:28.974', NULL, NULL, NULL),
('cmsznr4yc000yagqmj5ur7dia', 'campaign.resume', 'Campaign', 'cmsznr4xl000sagqmlvoy7mmo', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:28.980', NULL, NULL, NULL),
('cmsznr5c40013agqmhu0x70lb', 'campaign.launch', 'Campaign', 'cmsznr5bo000zagqmz4n21bnk', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:29.476', NULL, NULL, NULL),
('cmsznr5cd0014agqmzpokysqy', 'campaign.cancel', 'Campaign', 'cmsznr5bo000zagqmz4n21bnk', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:29.485', NULL, NULL, NULL),
('cmsznr5ct0017agqmibij58ou', 'campaign.launch', 'Campaign', 'cmsznr5ch0015agqmzbd9iach', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:29.501', NULL, NULL, NULL),
('cmsznr5d10018agqmj3nbja28', 'campaign.emergency_stop', NULL, NULL, NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:29.509', NULL, NULL, NULL),
('cmsznr65b0005agqmkfu5qqzx', 'plan.create', 'Plan', 'cmsznr6580004agqm1xfm95cf', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:30.527', NULL, NULL, NULL),
('cmsznr65p0006agqmysihj5bh', 'plan.update', 'Plan', 'cmsznr6580004agqm1xfm95cf', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:30.541', NULL, NULL, NULL),
('cmsznr6hk000aagqm1j5gnyp6', 'plan.delete', 'Plan', 'cmsznr6580004agqm1xfm95cf', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:30.968', NULL, NULL, NULL),
('cmsznr7kz0006agqmxea9d82b', 'organization.create', 'Organization', 'cmsznr7ks0004agqmqgcs59av', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:32.387', NULL, NULL, NULL),
('cmsznr7vk000aagqmb1h90s5r', 'organization.update', 'Organization', 'cmsznr7ks0004agqmqgcs59av', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:32.768', NULL, NULL, NULL),
('cmsznr7vv000bagqmvkd14luf', 'organization.modules_update', 'Organization', 'cmsznr7ks0004agqmqgcs59av', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:32.779', NULL, NULL, NULL),
('cmsznr7w6000cagqmpi8jthco', 'organization.modules_update', 'Organization', 'cmsznr7ks0004agqmqgcs59av', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:32.790', NULL, NULL, NULL),
('cmsznr7wg000dagqmn2o3mo3l', 'organization.service_toggle', 'Organization', 'cmsznr7ks0004agqmqgcs59av', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:32.800', NULL, NULL, NULL),
('cmsznr7ws000eagqmogi6ml2e', 'organization.impersonate', 'Organization', 'cmsznr7ks0004agqmqgcs59av', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:32.813', NULL, NULL, NULL),
('cmsznr7xh000fagqme4n4a0ux', 'organization.service_toggle', 'Organization', 'cmsznr7ks0004agqmqgcs59av', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:32.837', NULL, NULL, NULL),
('cmsznr7xq000gagqm14kfnxvo', 'organization.impersonate', 'Organization', 'cmsznr7ks0004agqmqgcs59av', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:32.846', NULL, NULL, NULL),
('cmsznr8kr000kagqmii8tif40', 'organization.user_password_reset', 'Organization', 'cmsznr7ks0004agqmqgcs59av', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:33.675', NULL, NULL, NULL),
('cmsznr8s4000magqmjqsw7ar1', 'organization.suspend', 'Organization', 'cmsznr7ks0004agqmqgcs59av', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:33.940', NULL, NULL, NULL),
('cmsznr8sd000nagqmriywbnom', 'organization.impersonate', 'Organization', 'cmsznr7ks0004agqmqgcs59av', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:33.949', NULL, NULL, NULL),
('cmsznr8sr000oagqmwpv22t90', 'organization.activate', 'Organization', 'cmsznr7ks0004agqmqgcs59av', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:33.963', NULL, NULL, NULL),
('cmsznr90f000uagqmogsrzg0g', 'organization.create', 'Organization', 'cmsznr8zx000qagqmxp70agcw', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:34.239', NULL, NULL, NULL),
('cmsznr91a000vagqm66eiwxbc', 'organization.update', 'Organization', 'cmsznr8zx000qagqmxp70agcw', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:34.270', NULL, NULL, NULL),
('cmsznr91n000wagqmtgsn0vu9', 'organization.update', 'Organization', 'cmsznr8zx000qagqmxp70agcw', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:34.283', NULL, NULL, NULL),
('cmsznr92c000zagqmb2mt5i8s', 'organization.update', 'Organization', 'cmsznr8zx000qagqmxp70agcw', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:34.308', NULL, NULL, NULL),
('cmsznr9ar0015agqmm0vlc463', 'organization.create', 'Organization', 'cmsznr9ae0011agqm8fv3v3u4', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:34.611', NULL, NULL, NULL),
('cmsznr9bj0016agqmf8xwcpmd', 'organization.update', 'Organization', 'cmsznr9ae0011agqm8fv3v3u4', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:34.639', NULL, NULL, NULL),
('cmsznr9c10017agqmzhvnw4v9', 'organization.update', 'Organization', 'cmsznr9ae0011agqm8fv3v3u4', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:34.657', NULL, NULL, NULL),
('cmsznr9cx001aagqmgd429af1', 'organization.update', 'Organization', 'cmsznr9ae0011agqm8fv3v3u4', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:34.689', NULL, NULL, NULL),
('cmsznr9lm001dagqmxeygnupb', 'organization.create', 'Organization', 'cmsznr9lg001bagqmg0lh1h4k', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:35.002', NULL, NULL, NULL),
('cmsznr9lx001eagqm0icle8w0', 'organization.modules_update', 'Organization', 'cmsznr9lg001bagqmg0lh1h4k', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:35.013', NULL, NULL, NULL),
('cmsznr9m4001fagqmra9w9l19', 'organization.impersonate', 'Organization', 'cmsznr9lg001bagqmg0lh1h4k', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:35.020', NULL, NULL, NULL),
('cmsznrdjz0005agqmh732asjn', 'user.create', 'User', 'cmsznrdjt0004agqmso3f5l21', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:40.127', NULL, NULL, NULL),
('cmsznrdze0009agqmvc3bjcuj', 'user.create', 'User', 'cmsznrdz80008agqmnqb8klre', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:40.682', NULL, NULL, NULL),
('cmsznrfl30003agqmevc9oalv', 'user.create', 'User', 'cmsznrfkt0002agqm6hn3r6rz', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:42.759', NULL, NULL, NULL),
('cmsznrjb1000aagqmw5w74ef7', 'organization.credits_adjust', 'CreditWallet', 'cmsznrjam0007agqm8l9c8qhz', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:47.581', NULL, NULL, NULL),
('cmsznrjby000dagqmhitvjd58', 'organization.credits_adjust', 'CreditWallet', 'cmsznrjaq0008agqmbqcsisxq', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:47.614', NULL, NULL, NULL),
('cmsznrkhn0002agqmal1svp5u', 'user.create', 'User', 'cmsznrkha0001agqmui2faszq', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:49.115', NULL, NULL, NULL),
('cmsznrki30003agqmf5ygh42b', 'user.update', 'User', 'cmsznrkha0001agqmui2faszq', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:49.131', NULL, NULL, NULL),
('cmsznrkpe0004agqmxhxbccnd', 'user.password_reset', 'User', 'cmsznrkha0001agqmui2faszq', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:49.394', NULL, NULL, NULL),
('cmsznrkx80006agqm5en1gybc', 'user.update', 'User', 'cmsznrkha0001agqmui2faszq', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:49.677', NULL, NULL, NULL),
('cmsznrkxw0007agqmjrbx763i', 'user.delete', 'User', 'cmsznrkha0001agqmui2faszq', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:49.700', NULL, NULL, NULL),
('cmsznrkyh0009agqmr6uqdbzi', 'role.create', 'Role', 'cmsznrkyd0008agqmdklvw0n1', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:49.721', NULL, NULL, NULL),
('cmsznrkyr000aagqm0wk5d68i', 'role.update', 'Role', 'cmsznrkyd0008agqmdklvw0n1', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:49.731', NULL, NULL, NULL),
('cmsznrkz1000bagqmuq6nsmfd', 'role.delete', 'Role', 'cmsznrkyd0008agqmdklvw0n1', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:49.741', NULL, NULL, NULL),
('cmsznrkz6000cagqmnx2hpfk3', 'setting.update', 'SystemSetting', 'e2e.test.1787117748286', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:49.746', NULL, NULL, NULL),
('cmsznrm230004agqm0lohnzqn', 'user.create', 'User', 'cmsznrm1w0003agqmi2zdig4l', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:51.147', NULL, NULL, NULL),
('cmsznrnnv0006agqmnogd3zwr', 'organization.credits_adjust', 'CreditWallet', 'cmsznrnnl0004agqmz82fi1v2', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:53.227', NULL, NULL, NULL),
('cmsznrnvf0008agqmd1jz8h4w', 'user.create', 'User', 'cmsznrnv60007agqmfnxo3jo0', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:53.499', NULL, NULL, NULL),
('cmsznros90008agqm9yshbikz', 'automation.create', 'Automation', 'cmsznros40007agqmrou40a3g', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:54.681', NULL, NULL, NULL),
('cmsznroye000eagqmq3wc4w93', 'automation.create', 'Automation', 'cmsznroyb000dagqmwmu1igok', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:54.902', NULL, NULL, NULL),
('cmsznrp1e000gagqmennbjewd', 'automation.update', 'Automation', 'cmsznros40007agqmrou40a3g', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:55.010', NULL, NULL, NULL),
('cmsznrp1j000hagqmmkmrlow2', 'automation.delete', 'Automation', 'cmsznros40007agqmrou40a3g', NULL, '::ffff:127.0.0.1', '2026-08-19 05:35:55.015', NULL, NULL, NULL),
('cmszo6mbs000axgqm2q9800rs', 'organization.credits_adjust', 'CreditWallet', 'cmszo6mb20007xgqmqi1qkk5n', NULL, '::ffff:127.0.0.1', '2026-08-19 05:47:31.336', NULL, NULL, NULL),
('cmszo6md2000dxgqm0im69d4f', 'organization.credits_adjust', 'CreditWallet', 'cmszo6mb80008xgqm9sw1rq6w', NULL, '::ffff:127.0.0.1', '2026-08-19 05:47:31.382', NULL, NULL, NULL),
('cmszo6nf5000bxgqm3tq4kk8e', 'organization.credits_adjust', 'CreditWallet', 'cmszo6ndx0009xgqmcyiqnykc', NULL, '::ffff:127.0.0.1', '2026-08-19 05:47:32.753', NULL, NULL, NULL),
('cmszo6o8i0006xgqmtlkr5nqn', 'organization.credits_adjust', 'CreditWallet', 'cmszo6o810004xgqm6btcofzq', NULL, '::ffff:127.0.0.1', '2026-08-19 05:47:33.810', NULL, NULL, NULL),
('cmszo6o8y0008xgqmteifphn2', 'organization.credits_adjust', 'CreditWallet', 'cmszo6o810004xgqm6btcofzq', NULL, '::ffff:127.0.0.1', '2026-08-19 05:47:33.826', NULL, NULL, NULL),
('cmszo7diu000a7sqm4sk1htru', 'organization.credits_adjust', 'CreditWallet', 'cmszo7di400077sqmsy3mcx2s', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:06.582', NULL, NULL, NULL),
('cmszo7dle000d7sqm4hsyn19f', 'organization.credits_adjust', 'CreditWallet', 'cmszo7di900087sqms175b5y6', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:06.674', NULL, NULL, NULL),
('cmszo7f5800067sqm1y2d1z1u', 'organization.create', 'Organization', 'cmszo7f4y00047sqmr2fafist', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:08.684', NULL, NULL, NULL),
('cmszo7fev000a7sqmviskj9a7', 'organization.update', 'Organization', 'cmszo7f4y00047sqmr2fafist', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:09.031', NULL, NULL, NULL),
('cmszo7ffj000b7sqm684oc3w5', 'organization.modules_update', 'Organization', 'cmszo7f4y00047sqmr2fafist', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:09.055', NULL, NULL, NULL),
('cmszo7ffy000c7sqm683wct42', 'organization.modules_update', 'Organization', 'cmszo7f4y00047sqmr2fafist', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:09.070', NULL, NULL, NULL),
('cmszo7fg4000d7sqmjos8957p', 'organization.service_toggle', 'Organization', 'cmszo7f4y00047sqmr2fafist', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:09.076', NULL, NULL, NULL),
('cmszo7fgc000e7sqmk8n15fqw', 'organization.impersonate', 'Organization', 'cmszo7f4y00047sqmr2fafist', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:09.084', NULL, NULL, NULL),
('cmszo7fgp000f7sqm7baz1662', 'organization.service_toggle', 'Organization', 'cmszo7f4y00047sqmr2fafist', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:09.097', NULL, NULL, NULL),
('cmszo7fgv000g7sqmsjbyelcp', 'organization.impersonate', 'Organization', 'cmszo7f4y00047sqmr2fafist', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:09.103', NULL, NULL, NULL),
('cmszo7g2z000k7sqm51yn1184', 'organization.user_password_reset', 'Organization', 'cmszo7f4y00047sqmr2fafist', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:09.899', NULL, NULL, NULL),
('cmszo7ga8000m7sqmf62z60rj', 'organization.suspend', 'Organization', 'cmszo7f4y00047sqmr2fafist', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:10.160', NULL, NULL, NULL),
('cmszo7gaj000n7sqmujt2k5iv', 'organization.impersonate', 'Organization', 'cmszo7f4y00047sqmr2fafist', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:10.171', NULL, NULL, NULL),
('cmszo7gb0000o7sqm6cx2hpa0', 'organization.activate', 'Organization', 'cmszo7f4y00047sqmr2fafist', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:10.188', NULL, NULL, NULL),
('cmszo7giv000u7sqmqqbsth46', 'organization.create', 'Organization', 'cmszo7gif000q7sqm1vtnw7i3', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:10.471', NULL, NULL, NULL),
('cmszo7gjn000v7sqmclnez0bv', 'organization.update', 'Organization', 'cmszo7gif000q7sqm1vtnw7i3', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:10.499', NULL, NULL, NULL),
('cmszo7gk5000w7sqmpvrouuk6', 'organization.update', 'Organization', 'cmszo7gif000q7sqm1vtnw7i3', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:10.517', NULL, NULL, NULL),
('cmszo7gkx000z7sqmn60jyuof', 'organization.update', 'Organization', 'cmszo7gif000q7sqm1vtnw7i3', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:10.545', NULL, NULL, NULL),
('cmszo7gt600157sqm5aubzprx', 'organization.create', 'Organization', 'cmszo7gsr00117sqm63sqn962', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:10.842', NULL, NULL, NULL),
('cmszo7gtl00167sqmki4lqehx', 'organization.update', 'Organization', 'cmszo7gsr00117sqm63sqn962', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:10.857', NULL, NULL, NULL),
('cmszo7gtz00177sqml8hu7645', 'organization.update', 'Organization', 'cmszo7gsr00117sqm63sqn962', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:10.871', NULL, NULL, NULL);
INSERT INTO `auditlog` (`id`, `action`, `entityType`, `entityId`, `metadata`, `ipAddress`, `createdAt`, `userId`, `actorRole`, `organizationId`) VALUES
('cmszo7guj001a7sqmm3nz17ym', 'organization.update', 'Organization', 'cmszo7gsr00117sqm63sqn962', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:10.891', NULL, NULL, NULL),
('cmszo7h1b001d7sqmdkvzeyxz', 'organization.create', 'Organization', 'cmszo7h13001b7sqmck2e3k6v', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:11.135', NULL, NULL, NULL),
('cmszo7h1l001e7sqm7uu04ml9', 'organization.modules_update', 'Organization', 'cmszo7h13001b7sqmck2e3k6v', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:11.145', NULL, NULL, NULL),
('cmszo7h2p001f7sqmp7vpuh1j', 'organization.impersonate', 'Organization', 'cmszo7h13001b7sqmck2e3k6v', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:11.185', NULL, NULL, NULL),
('cmszo7l5i00057sqmg3r19roj', 'user.create', 'User', 'cmszo7l5700047sqm77p1rcn4', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:16.471', NULL, NULL, NULL),
('cmszo7le400077sqm19t2sktk', 'user.create', 'User', 'cmszo7ldy00067sqmbt0uvtxn', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:16.780', NULL, NULL, NULL),
('cmszo7lep00087sqmgxdu6exz', 'user.update', 'User', 'cmszo7khr00017sqminu0rerf', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:16.801', NULL, NULL, NULL),
('cmszo7ma4000e7sqm0h7l4qkj', 'campaign.launch', 'Campaign', 'cmszo7m8s00097sqmtbvvatzm', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:17.932', NULL, NULL, NULL),
('cmszo7mon000l7sqm2s2aiqrw', 'campaign.relaunch', 'Campaign', 'cmszo7moe000g7sqm30kxrpif', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:18.455', NULL, NULL, NULL),
('cmszo7muc000r7sqmquyj5dhg', 'campaign.launch', 'Campaign', 'cmszo7mtj000n7sqm1t7brri3', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:18.660', NULL, NULL, NULL),
('cmszo7npc000w7sqmvze8uid5', 'campaign.launch', 'Campaign', 'cmszo7nov000s7sqm83lypa8s', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:19.776', NULL, NULL, NULL),
('cmszo7npo000x7sqmqi12cvh4', 'campaign.pause', 'Campaign', 'cmszo7nov000s7sqm83lypa8s', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:19.788', NULL, NULL, NULL),
('cmszo7nq0000y7sqmvy9v02o6', 'campaign.resume', 'Campaign', 'cmszo7nov000s7sqm83lypa8s', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:19.800', NULL, NULL, NULL),
('cmszo7o8800137sqm6s7bldjf', 'campaign.launch', 'Campaign', 'cmszo7o7q000z7sqmjlnvxwb7', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:20.456', NULL, NULL, NULL),
('cmszo7o8g00147sqmybxinqll', 'campaign.cancel', 'Campaign', 'cmszo7o7q000z7sqmjlnvxwb7', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:20.464', NULL, NULL, NULL),
('cmszo7o8v00177sqmusu628yx', 'campaign.launch', 'Campaign', 'cmszo7o8k00157sqm42s0ilhx', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:20.479', NULL, NULL, NULL),
('cmszo7o9300187sqmau5nzyob', 'campaign.emergency_stop', NULL, NULL, NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:20.487', NULL, NULL, NULL),
('cmszo7pml00057sqmruoiey9i', 'user.create', 'User', 'cmszo7pme00047sqm9sitwx97', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:22.269', NULL, NULL, NULL),
('cmszo7q2100097sqmhxrxil09', 'user.create', 'User', 'cmszo7q1v00087sqmokqtj2vb', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:22.825', NULL, NULL, NULL),
('cmszo7riw00037sqmz08ez22m', 'user.create', 'User', 'cmszo7rip00027sqm7br0w8cd', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:24.728', NULL, NULL, NULL),
('cmszo7tpu00027sqm0ta6i3j3', 'user.create', 'User', 'cmszo7tpj00017sqmnlh5f0tw', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:27.570', NULL, NULL, NULL),
('cmszo7tqj00037sqm7ivhosxe', 'user.update', 'User', 'cmszo7tpj00017sqmnlh5f0tw', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:27.595', NULL, NULL, NULL),
('cmszo7ty600047sqmpkbtj24b', 'user.password_reset', 'User', 'cmszo7tpj00017sqmnlh5f0tw', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:27.870', NULL, NULL, NULL),
('cmszo7u5m00067sqm9dqmvl0v', 'user.update', 'User', 'cmszo7tpj00017sqmnlh5f0tw', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:28.138', NULL, NULL, NULL),
('cmszo7u6700077sqmkuiqyxcj', 'user.delete', 'User', 'cmszo7tpj00017sqmnlh5f0tw', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:28.159', NULL, NULL, NULL),
('cmszo7u6z00097sqmfxzbw6qs', 'role.create', 'Role', 'cmszo7u6v00087sqmsysj3xhx', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:28.187', NULL, NULL, NULL),
('cmszo7u7a000a7sqmyctfkkme', 'role.update', 'Role', 'cmszo7u6v00087sqmsysj3xhx', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:28.198', NULL, NULL, NULL),
('cmszo7u7n000b7sqmdbnmcxia', 'role.delete', 'Role', 'cmszo7u6v00087sqmsysj3xhx', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:28.211', NULL, NULL, NULL),
('cmszo7u7s000c7sqmspwkd7u3', 'setting.update', 'SystemSetting', 'e2e.test.1787118507022', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:28.216', NULL, NULL, NULL),
('cmszo7vcb00067sqmhjpgooqt', 'organization.credits_adjust', 'CreditWallet', 'cmszo7vc400047sqm38sxpk8n', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:29.675', NULL, NULL, NULL),
('cmszo7vjy00087sqmvr2vhhkv', 'user.create', 'User', 'cmszo7vjs00077sqmvqlvxdjd', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:29.950', NULL, NULL, NULL),
('cmszo7wns00047sqm5iyg2rks', 'user.create', 'User', 'cmszo7wnl00037sqmj42f88dm', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:31.384', NULL, NULL, NULL),
('cmszo7ziq00087sqmekqcjfdf', 'automation.create', 'Automation', 'cmszo7zil00077sqm05hdtvns', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:35.090', NULL, NULL, NULL),
('cmszo7zpf000e7sqm1y0j4qsh', 'automation.create', 'Automation', 'cmszo7zpb000d7sqmf7d0k6q5', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:35.331', NULL, NULL, NULL),
('cmszo7zsv000g7sqmh07fkiia', 'automation.update', 'Automation', 'cmszo7zil00077sqm05hdtvns', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:35.455', NULL, NULL, NULL),
('cmszo7zt0000h7sqmqbjw0d2k', 'automation.delete', 'Automation', 'cmszo7zil00077sqm05hdtvns', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:35.460', NULL, NULL, NULL),
('cmszo80z100057sqmou4o0ltt', 'plan.create', 'Plan', 'cmszo80yv00047sqmzqx2cm36', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:36.973', NULL, NULL, NULL),
('cmszo80zn00067sqmzrkaz7wd', 'plan.update', 'Plan', 'cmszo80yv00047sqmzqx2cm36', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:36.995', NULL, NULL, NULL),
('cmszo81eq000a7sqmmac1k2q2', 'plan.delete', 'Plan', 'cmszo80yv00047sqmzqx2cm36', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:37.538', NULL, NULL, NULL),
('cmszo82hz000b7sqml23282vh', 'organization.credits_adjust', 'CreditWallet', 'cmszo82g800097sqmghysafmf', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:38.951', NULL, NULL, NULL),
('cmszo876700067sqm2sx6ngbf', 'organization.credits_adjust', 'CreditWallet', 'cmszo875h00047sqm7d46mwab', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:45.007', NULL, NULL, NULL),
('cmszo876z00087sqm2w4vtlk6', 'organization.credits_adjust', 'CreditWallet', 'cmszo875h00047sqm7d46mwab', NULL, '::ffff:127.0.0.1', '2026-08-19 05:48:45.035', NULL, NULL, NULL),
('cmszonvp3000aisqmwtafv9ia', 'organization.credits_adjust', 'CreditWallet', 'cmszonvo40007isqmmzot6f0x', NULL, '::ffff:127.0.0.1', '2026-08-19 06:00:56.631', NULL, NULL, NULL),
('cmszonvrq000disqm5wvx8hqf', 'organization.credits_adjust', 'CreditWallet', 'cmszonvo90008isqm9a36m5fw', NULL, '::ffff:127.0.0.1', '2026-08-19 06:00:56.726', NULL, NULL, NULL),
('cmszonx7f0006isqm4h0gudg2', 'organization.create', 'Organization', 'cmszonx750004isqmx1f3jxao', NULL, '::ffff:127.0.0.1', '2026-08-19 06:00:58.587', NULL, NULL, NULL),
('cmszonxia000aisqm99bw0azy', 'organization.update', 'Organization', 'cmszonx750004isqmx1f3jxao', NULL, '::ffff:127.0.0.1', '2026-08-19 06:00:58.978', NULL, NULL, NULL),
('cmszonxih000bisqm1ly3ao5c', 'organization.modules_update', 'Organization', 'cmszonx750004isqmx1f3jxao', NULL, '::ffff:127.0.0.1', '2026-08-19 06:00:58.985', NULL, NULL, NULL),
('cmszonxio000cisqms7apmhzs', 'organization.modules_update', 'Organization', 'cmszonx750004isqmx1f3jxao', NULL, '::ffff:127.0.0.1', '2026-08-19 06:00:58.992', NULL, NULL, NULL),
('cmszonxiu000disqmrxewk9f3', 'organization.service_toggle', 'Organization', 'cmszonx750004isqmx1f3jxao', NULL, '::ffff:127.0.0.1', '2026-08-19 06:00:58.998', NULL, NULL, NULL),
('cmszonxj8000eisqme66smolr', 'organization.impersonate', 'Organization', 'cmszonx750004isqmx1f3jxao', NULL, '::ffff:127.0.0.1', '2026-08-19 06:00:59.012', NULL, NULL, NULL),
('cmszonxjs000fisqmnkl4jws7', 'organization.service_toggle', 'Organization', 'cmszonx750004isqmx1f3jxao', NULL, '::ffff:127.0.0.1', '2026-08-19 06:00:59.032', NULL, NULL, NULL),
('cmszonxk4000gisqm00vylvih', 'organization.impersonate', 'Organization', 'cmszonx750004isqmx1f3jxao', NULL, '::ffff:127.0.0.1', '2026-08-19 06:00:59.044', NULL, NULL, NULL),
('cmszony88000kisqm47jcniyk', 'organization.user_password_reset', 'Organization', 'cmszonx750004isqmx1f3jxao', NULL, '::ffff:127.0.0.1', '2026-08-19 06:00:59.912', NULL, NULL, NULL),
('cmszonygl000misqmfurmxeze', 'organization.suspend', 'Organization', 'cmszonx750004isqmx1f3jxao', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:00.213', NULL, NULL, NULL),
('cmszonygy000nisqm2uku1e8o', 'organization.impersonate', 'Organization', 'cmszonx750004isqmx1f3jxao', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:00.226', NULL, NULL, NULL),
('cmszonyha000oisqmxps3q577', 'organization.activate', 'Organization', 'cmszonx750004isqmx1f3jxao', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:00.238', NULL, NULL, NULL),
('cmszonyp9000uisqmv7gwckyc', 'organization.create', 'Organization', 'cmszonyou000qisqmiescjzo2', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:00.525', NULL, NULL, NULL),
('cmszonyq4000visqmoqbsd0h0', 'organization.update', 'Organization', 'cmszonyou000qisqmiescjzo2', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:00.556', NULL, NULL, NULL),
('cmszonyqm000wisqmllx0tlsi', 'organization.update', 'Organization', 'cmszonyou000qisqmiescjzo2', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:00.574', NULL, NULL, NULL),
('cmszonyrh000zisqm8kpsvtdo', 'organization.update', 'Organization', 'cmszonyou000qisqmiescjzo2', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:00.605', NULL, NULL, NULL),
('cmszonz0e0015isqmmvtb8szq', 'organization.create', 'Organization', 'cmszonyzt0011isqmflc8p5z6', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:00.926', NULL, NULL, NULL),
('cmszonz180016isqmchcddjrs', 'organization.update', 'Organization', 'cmszonyzt0011isqmflc8p5z6', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:00.956', NULL, NULL, NULL),
('cmszonz1t0017isqmvk28jkvm', 'organization.update', 'Organization', 'cmszonyzt0011isqmflc8p5z6', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:00.977', NULL, NULL, NULL),
('cmszonz2n001aisqm9ddnytcv', 'organization.update', 'Organization', 'cmszonyzt0011isqmflc8p5z6', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:01.007', NULL, NULL, NULL),
('cmszonzaf001disqmi81e1kjb', 'organization.create', 'Organization', 'cmszonzaa001bisqmqt0bk09h', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:01.287', NULL, NULL, NULL),
('cmszonzat001eisqmn669vfl4', 'organization.modules_update', 'Organization', 'cmszonzaa001bisqmqt0bk09h', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:01.301', NULL, NULL, NULL),
('cmszonzb2001fisqm5slyu4o7', 'organization.impersonate', 'Organization', 'cmszonzaa001bisqmqt0bk09h', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:01.310', NULL, NULL, NULL),
('cmszoo1it000eisqmdxnt0ygc', 'campaign.launch', 'Campaign', 'cmszoo1gq0009isqmx2f25r97', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:04.181', NULL, NULL, NULL),
('cmszoo1tm000lisqml5gmdky1', 'campaign.relaunch', 'Campaign', 'cmszoo1t8000gisqm30n6c4z4', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:04.570', NULL, NULL, NULL),
('cmszoo1z6000risqmsk7vk9rh', 'campaign.launch', 'Campaign', 'cmszoo1yn000nisqmyqmkbq57', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:04.770', NULL, NULL, NULL),
('cmszoo2z8000wisqm1uyayk2o', 'campaign.launch', 'Campaign', 'cmszoo2yf000sisqm4uaw0225', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:06.068', NULL, NULL, NULL),
('cmszoo2zk000xisqmg38ix3e1', 'campaign.pause', 'Campaign', 'cmszoo2yf000sisqm4uaw0225', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:06.080', NULL, NULL, NULL),
('cmszoo2zu000yisqmge91gkcf', 'campaign.resume', 'Campaign', 'cmszoo2yf000sisqm4uaw0225', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:06.090', NULL, NULL, NULL),
('cmszoo3d80013isqmjzsf6tjq', 'campaign.launch', 'Campaign', 'cmszoo3cr000zisqmjjcjz6n6', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:06.572', NULL, NULL, NULL),
('cmszoo3dk0014isqmn69bifur', 'campaign.cancel', 'Campaign', 'cmszoo3cr000zisqmjjcjz6n6', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:06.585', NULL, NULL, NULL),
('cmszoo3e50017isqm986e2lm4', 'campaign.launch', 'Campaign', 'cmszoo3dq0015isqmvzl2tkvn', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:06.605', NULL, NULL, NULL),
('cmszoo3ed0018isqm0du09iku', 'campaign.emergency_stop', NULL, NULL, NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:06.613', NULL, NULL, NULL),
('cmszoo4ei0008isqmdwqt3pij', 'automation.create', 'Automation', 'cmszoo4ee0007isqm1oyz03p2', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:07.914', NULL, NULL, NULL),
('cmszoo4ky000eisqmxz3wou5q', 'automation.create', 'Automation', 'cmszoo4kv000disqmsr667vtk', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:08.146', NULL, NULL, NULL),
('cmszoo4o1000gisqmv79uno0g', 'automation.update', 'Automation', 'cmszoo4ee0007isqm1oyz03p2', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:08.257', NULL, NULL, NULL),
('cmszoo4oa000hisqm7jfnw307', 'automation.delete', 'Automation', 'cmszoo4ee0007isqm1oyz03p2', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:08.266', NULL, NULL, NULL),
('cmszoo8q60005isqmiz2xdxvq', 'user.create', 'User', 'cmszoo8py0004isqmx6g7olii', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:13.518', NULL, NULL, NULL),
('cmszoo95y0009isqmaap3rg72', 'user.create', 'User', 'cmszoo95t0008isqmyhhiu005', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:14.086', NULL, NULL, NULL),
('cmszooaq70005isqmncw3ifs2', 'user.create', 'User', 'cmszooaq00004isqmrq0bziuo', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:16.111', NULL, NULL, NULL),
('cmszooay20007isqmrqg31z2n', 'user.create', 'User', 'cmszooaxv0006isqmp832114n', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:16.394', NULL, NULL, NULL),
('cmszooayp0008isqmt56skh0v', 'user.update', 'User', 'cmszooa400001isqmaxr41qf9', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:16.417', NULL, NULL, NULL),
('cmszooc900003isqme14r5776', 'user.create', 'User', 'cmszooc8o0002isqmhibr9c02', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:18.084', NULL, NULL, NULL),
('cmszoodr90005isqmizipkhnk', 'plan.create', 'Plan', 'cmszoodr60004isqmql7n5jnd', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:20.037', NULL, NULL, NULL),
('cmszoodrk0006isqmpymuc8c0', 'plan.update', 'Plan', 'cmszoodr60004isqmql7n5jnd', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:20.048', NULL, NULL, NULL),
('cmszooe6v000aisqmianepf53', 'plan.delete', 'Plan', 'cmszoodr60004isqmql7n5jnd', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:20.599', NULL, NULL, NULL),
('cmszoofc70004isqmlzhkgxou', 'user.create', 'User', 'cmszoofc10003isqmkwdfkilf', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:22.087', NULL, NULL, NULL),
('cmszoogsc0006isqm7kq0x58d', 'organization.credits_adjust', 'CreditWallet', 'cmszoogs10004isqmu6h7lwes', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:23.964', NULL, NULL, NULL),
('cmszooh0u0008isqmpgdtyteq', 'user.create', 'User', 'cmszooh0m0007isqm9nnr93co', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:24.270', NULL, NULL, NULL),
('cmszooi8k0006isqmc2to85fq', 'organization.credits_adjust', 'CreditWallet', 'cmszooi810004isqmrfnphzxj', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:25.844', NULL, NULL, NULL),
('cmszooi910008isqmjpm23iqr', 'organization.credits_adjust', 'CreditWallet', 'cmszooi810004isqmrfnphzxj', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:25.861', NULL, NULL, NULL),
('cmszooj2c000bisqmmq8k4ldf', 'organization.credits_adjust', 'CreditWallet', 'cmszooj180009isqmvnzgbkkg', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:26.916', NULL, NULL, NULL),
('cmszoolhn0002isqmvxqs56h7', 'user.create', 'User', 'cmszoolha0001isqms8am4n5b', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:30.059', NULL, NULL, NULL),
('cmszoolig0003isqm6n6s0n2g', 'user.update', 'User', 'cmszoolha0001isqms8am4n5b', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:30.088', NULL, NULL, NULL),
('cmszoolpm0004isqmfslbzjvm', 'user.password_reset', 'User', 'cmszoolha0001isqms8am4n5b', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:30.346', NULL, NULL, NULL),
('cmszoolx70006isqmz0mnrxog', 'user.update', 'User', 'cmszoolha0001isqms8am4n5b', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:30.619', NULL, NULL, NULL),
('cmszoolxx0007isqmmojzy1gi', 'user.delete', 'User', 'cmszoolha0001isqms8am4n5b', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:30.645', NULL, NULL, NULL),
('cmszoolyx0009isqmuj7gcwpu', 'role.create', 'Role', 'cmszoolyq0008isqmv3gb4alo', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:30.681', NULL, NULL, NULL),
('cmszoolzo000aisqmgwhbjiz4', 'role.update', 'Role', 'cmszoolyq0008isqmv3gb4alo', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:30.708', NULL, NULL, NULL),
('cmszoom0d000bisqm58q3v28d', 'role.delete', 'Role', 'cmszoolyq0008isqmv3gb4alo', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:30.733', NULL, NULL, NULL),
('cmszoom0n000cisqmeurm1wmy', 'setting.update', 'SystemSetting', 'e2e.test.1787119289400', NULL, '::ffff:127.0.0.1', '2026-08-19 06:01:30.743', NULL, NULL, NULL),
('cmszop9ee000314qmre4g3bxa', 'organization.suspend', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-19 06:02:01.046', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszopa8e000414qmfzmvm1yr', 'organization.service_toggle', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-19 06:02:02.126', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszopb0c000514qmpku6j85c', 'organization.activate', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-19 06:02:03.132', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszopb97000614qmdl8e4nm9', 'organization.service_toggle', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-19 06:02:03.451', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszorfdb000d14qmi475ap2q', 'organization.modules_update', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-19 06:03:42.095', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszp0s7r000j14qmiqda6dzm', 'role.create', 'Role', 'cmszp0s7m000i14qm6nh1cwqo', NULL, '::1', '2026-08-19 06:10:58.647', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszp0sc7000k14qmzh46l8fp', 'role.update', 'Role', 'cmszp0s7m000i14qm6nh1cwqo', NULL, '::1', '2026-08-19 06:10:58.807', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszp0sda000l14qm7dlq4bct', 'role.delete', 'Role', 'cmszp0s7m000i14qm6nh1cwqo', NULL, '::1', '2026-08-19 06:10:58.846', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszp9e590001okqm7p7nbd1q', 'organization.impersonate', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-19 06:17:40.317', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszp9nis0003okqm6bm5qvav', 'organization.impersonate', 'Organization', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, '::1', '2026-08-19 06:17:52.468', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszp9nwk0005okqmrufcf0cn', 'campaign.delete', 'Campaign', 'cmszp9nsn0004okqm8l02341j', NULL, '::1', '2026-08-19 06:17:52.964', 'cmsyx4vjg0004dcqmxk4wp1mx', NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmszpb20i000eh0qmyza0hhgc', 'campaign.launch', 'Campaign', 'cmszpb1yx0009h0qmpd4ysb7r', NULL, '::ffff:127.0.0.1', '2026-08-19 06:18:57.906', NULL, NULL, NULL),
('cmszpb269000lh0qm87nvxh8e', 'campaign.relaunch', 'Campaign', 'cmszpb25s000gh0qm0s7tbkxm', NULL, '::ffff:127.0.0.1', '2026-08-19 06:18:58.113', NULL, NULL, NULL),
('cmszpb2b3000rh0qmqnyol52h', 'campaign.launch', 'Campaign', 'cmszpb2ap000nh0qmt0lc0td7', NULL, '::ffff:127.0.0.1', '2026-08-19 06:18:58.287', NULL, NULL, NULL),
('cmszpb36g000wh0qm2ezdiwce', 'campaign.launch', 'Campaign', 'cmszpb362000sh0qmn4rk85g8', NULL, '::ffff:127.0.0.1', '2026-08-19 06:18:59.416', NULL, NULL, NULL),
('cmszpb36o000xh0qmdqlwkdh1', 'campaign.pause', 'Campaign', 'cmszpb362000sh0qmn4rk85g8', NULL, '::ffff:127.0.0.1', '2026-08-19 06:18:59.424', NULL, NULL, NULL),
('cmszpb36w000yh0qms97skpxb', 'campaign.resume', 'Campaign', 'cmszpb362000sh0qmn4rk85g8', NULL, '::ffff:127.0.0.1', '2026-08-19 06:18:59.432', NULL, NULL, NULL),
('cmszpb3by0013h0qmmkc4qxo6', 'campaign.launch', 'Campaign', 'cmszpb3bj000zh0qmtykt8041', NULL, '::ffff:127.0.0.1', '2026-08-19 06:18:59.614', NULL, NULL, NULL),
('cmszpb3c60014h0qm1iemy9yl', 'campaign.cancel', 'Campaign', 'cmszpb3bj000zh0qmtykt8041', NULL, '::ffff:127.0.0.1', '2026-08-19 06:18:59.622', NULL, NULL, NULL),
('cmszpb3cm0017h0qmp05jm1h8', 'campaign.launch', 'Campaign', 'cmszpb3ca0015h0qmco61e4o2', NULL, '::ffff:127.0.0.1', '2026-08-19 06:18:59.638', NULL, NULL, NULL),
('cmszpb3cu0018h0qmwojw9as0', 'campaign.emergency_stop', NULL, NULL, NULL, '::ffff:127.0.0.1', '2026-08-19 06:18:59.646', NULL, NULL, NULL),
('cmszpb3d8001ah0qm3xxmeua9', 'campaign.delete', 'Campaign', 'cmszpb3d00019h0qmhccqj2rs', NULL, '::ffff:127.0.0.1', '2026-08-19 06:18:59.660', NULL, NULL, NULL),
('cmszpb3j2001ch0qmf577cvnw', 'user.create', 'User', 'cmszpb3iy001bh0qm0kgvwup9', NULL, '::ffff:127.0.0.1', '2026-08-19 06:18:59.870', NULL, NULL, NULL),
('cmszpbrjc000eiwqmt9lhqzpu', 'campaign.launch', 'Campaign', 'cmszpbrhp0009iwqmqffef8tc', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:30.984', NULL, NULL, NULL),
('cmszpbroz000liwqm4bapfoco', 'campaign.relaunch', 'Campaign', 'cmszpbron000giwqm9y2uehs6', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:31.187', NULL, NULL, NULL),
('cmszpbru3000riwqm9d56n2z6', 'campaign.launch', 'Campaign', 'cmszpbrto000niwqmys5jx6em', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:31.371', NULL, NULL, NULL),
('cmszpbsp8000wiwqmp2ziphzs', 'campaign.launch', 'Campaign', 'cmszpbsos000siwqm0q8p9t29', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:32.492', NULL, NULL, NULL),
('cmszpbspf000xiwqmyhaetjs1', 'campaign.pause', 'Campaign', 'cmszpbsos000siwqm0q8p9t29', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:32.499', NULL, NULL, NULL),
('cmszpbspm000yiwqmd398sop7', 'campaign.resume', 'Campaign', 'cmszpbsos000siwqm0q8p9t29', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:32.506', NULL, NULL, NULL),
('cmszpbsyv0013iwqm7w5npy0a', 'campaign.launch', 'Campaign', 'cmszpbsyg000ziwqm305vsi7k', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:32.839', NULL, NULL, NULL),
('cmszpbsz30014iwqm6j0ekk48', 'campaign.cancel', 'Campaign', 'cmszpbsyg000ziwqm305vsi7k', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:32.847', NULL, NULL, NULL),
('cmszpbszk0017iwqm1rvima74', 'campaign.launch', 'Campaign', 'cmszpbsz80015iwqm4e6r9in9', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:32.864', NULL, NULL, NULL),
('cmszpbszs0018iwqmekkujmu2', 'campaign.emergency_stop', NULL, NULL, NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:32.872', NULL, NULL, NULL),
('cmszpbt07001aiwqmrkjd6g0t', 'campaign.delete', 'Campaign', 'cmszpbszz0019iwqmsjh93e75', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:32.887', NULL, NULL, NULL),
('cmszpbt60001ciwqmx2wrybvb', 'user.create', 'User', 'cmszpbt5w001biwqmgsb26ahv', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:33.096', NULL, NULL, NULL),
('cmszpbuen000aiwqm41l1vj3k', 'organization.credits_adjust', 'CreditWallet', 'cmszpbue30007iwqmfizmbrci', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:34.703', NULL, NULL, NULL),
('cmszpbufq000diwqm1xrbe2ic', 'organization.credits_adjust', 'CreditWallet', 'cmszpbue80008iwqmp82hagbr', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:34.742', NULL, NULL, NULL),
('cmszpbvg30006iwqm74e7es8e', 'organization.create', 'Organization', 'cmszpbvfy0004iwqmxveu6jac', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:36.051', NULL, NULL, NULL),
('cmszpbvnq000aiwqmdkyps4gm', 'organization.update', 'Organization', 'cmszpbvfy0004iwqmxveu6jac', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:36.326', NULL, NULL, NULL),
('cmszpbvnx000biwqmymhyrl8u', 'organization.modules_update', 'Organization', 'cmszpbvfy0004iwqmxveu6jac', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:36.333', NULL, NULL, NULL),
('cmszpbvo2000ciwqmt7spzd5a', 'organization.modules_update', 'Organization', 'cmszpbvfy0004iwqmxveu6jac', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:36.338', NULL, NULL, NULL),
('cmszpbvo9000diwqm2x6ajb13', 'organization.service_toggle', 'Organization', 'cmszpbvfy0004iwqmxveu6jac', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:36.345', NULL, NULL, NULL),
('cmszpbvog000eiwqm5x3xrn9r', 'organization.impersonate', 'Organization', 'cmszpbvfy0004iwqmxveu6jac', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:36.352', NULL, NULL, NULL),
('cmszpbvos000fiwqmfyi0msuf', 'organization.service_toggle', 'Organization', 'cmszpbvfy0004iwqmxveu6jac', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:36.364', NULL, NULL, NULL),
('cmszpbvoy000giwqmztotg6bu', 'organization.impersonate', 'Organization', 'cmszpbvfy0004iwqmxveu6jac', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:36.370', NULL, NULL, NULL),
('cmszpbw6i000kiwqm67x2slpg', 'organization.user_password_reset', 'Organization', 'cmszpbvfy0004iwqmxveu6jac', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.002', NULL, NULL, NULL),
('cmszpbwcb000miwqmcgezyell', 'organization.suspend', 'Organization', 'cmszpbvfy0004iwqmxveu6jac', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.211', NULL, NULL, NULL),
('cmszpbwch000niwqm499j2nyo', 'organization.impersonate', 'Organization', 'cmszpbvfy0004iwqmxveu6jac', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.217', NULL, NULL, NULL),
('cmszpbwcp000oiwqm1lndrfa6', 'organization.activate', 'Organization', 'cmszpbvfy0004iwqmxveu6jac', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.225', NULL, NULL, NULL),
('cmszpbwiu000uiwqmq9rwh774', 'organization.create', 'Organization', 'cmszpbwil000qiwqmhapv4an8', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.446', NULL, NULL, NULL),
('cmszpbwjf000viwqme3czf8wb', 'organization.update', 'Organization', 'cmszpbwil000qiwqmhapv4an8', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.467', NULL, NULL, NULL),
('cmszpbwjo000wiwqmd4wgidaf', 'organization.update', 'Organization', 'cmszpbwil000qiwqmhapv4an8', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.476', NULL, NULL, NULL),
('cmszpbwk3000ziwqm8u5grv0w', 'organization.update', 'Organization', 'cmszpbwil000qiwqmhapv4an8', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.491', NULL, NULL, NULL),
('cmszpbwqc0015iwqmpn4jqq5c', 'organization.create', 'Organization', 'cmszpbwq30011iwqm1a5bgk5y', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.716', NULL, NULL, NULL),
('cmszpbwqk0016iwqm1uxz0jvw', 'organization.update', 'Organization', 'cmszpbwq30011iwqm1a5bgk5y', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.724', NULL, NULL, NULL),
('cmszpbwqu0017iwqma27ox7jv', 'organization.update', 'Organization', 'cmszpbwq30011iwqm1a5bgk5y', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.734', NULL, NULL, NULL),
('cmszpbwr8001aiwqmdtpcnrei', 'organization.update', 'Organization', 'cmszpbwq30011iwqm1a5bgk5y', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.748', NULL, NULL, NULL),
('cmszpbwx5001diwqmw5a4imrw', 'organization.create', 'Organization', 'cmszpbwx1001biwqmxk2m39s8', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.961', NULL, NULL, NULL),
('cmszpbwxa001eiwqmmh1buz1m', 'organization.modules_update', 'Organization', 'cmszpbwx1001biwqmxk2m39s8', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.966', NULL, NULL, NULL),
('cmszpbwxf001fiwqmjm4oxr1g', 'organization.impersonate', 'Organization', 'cmszpbwx1001biwqmxk2m39s8', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:37.971', NULL, NULL, NULL),
('cmszpbzuh0005iwqmfw68glxw', 'user.create', 'User', 'cmszpbzud0004iwqmt8tzxqid', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:41.753', NULL, NULL, NULL),
('cmszpc06v0009iwqmkutuifw7', 'user.create', 'User', 'cmszpc06r0008iwqmkthjwv43', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:42.199', NULL, NULL, NULL),
('cmszpc18v0003iwqmodaufj2n', 'user.create', 'User', 'cmszpc18r0002iwqmx18ijj3q', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:43.567', NULL, NULL, NULL),
('cmszpc2gc0005iwqmg10fjplm', 'user.create', 'User', 'cmszpc2g70004iwqm7gr6j74p', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:45.132', NULL, NULL, NULL),
('cmszpc2mb0007iwqmjsygwugs', 'user.create', 'User', 'cmszpc2m80006iwqmizdzantt', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:45.347', NULL, NULL, NULL),
('cmszpc2mq0008iwqm6xkv457q', 'user.update', 'User', 'cmszpc1yi0001iwqmi6aqh4uj', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:45.363', NULL, NULL, NULL),
('cmszpc3ea0004iwqmvhu8pny8', 'user.create', 'User', 'cmszpc3e60003iwqmd6fcv33r', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:46.354', NULL, NULL, NULL),
('cmszpc4e10005iwqm90x2w6t9', 'plan.create', 'Plan', 'cmszpc4dy0004iwqmytvarkrq', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:47.641', NULL, NULL, NULL),
('cmszpc4ee0006iwqma027cu1h', 'plan.update', 'Plan', 'cmszpc4dy0004iwqmytvarkrq', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:47.654', NULL, NULL, NULL),
('cmszpc4q8000aiwqmczhyd9ug', 'plan.delete', 'Plan', 'cmszpc4dy0004iwqmytvarkrq', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:48.080', NULL, NULL, NULL),
('cmszpc5ac0002iwqm7fj822nm', 'user.create', 'User', 'cmszpc5a70001iwqmdr198j18', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:48.804', NULL, NULL, NULL),
('cmszpc5an0003iwqmwammso6v', 'user.update', 'User', 'cmszpc5a70001iwqmdr198j18', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:48.815', NULL, NULL, NULL),
('cmszpc5gb0004iwqm10soef0r', 'user.password_reset', 'User', 'cmszpc5a70001iwqmdr198j18', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:49.019', NULL, NULL, NULL),
('cmszpc5m50006iwqmvs6jwvuu', 'user.update', 'User', 'cmszpc5a70001iwqmdr198j18', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:49.229', NULL, NULL, NULL),
('cmszpc5mk0007iwqm99hz69nl', 'user.delete', 'User', 'cmszpc5a70001iwqmdr198j18', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:49.244', NULL, NULL, NULL),
('cmszpc5n70009iwqm4wzwjrad', 'role.create', 'Role', 'cmszpc5n30008iwqmnfn3tkdn', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:49.267', NULL, NULL, NULL),
('cmszpc5nh000aiwqmg055frkq', 'role.update', 'Role', 'cmszpc5n30008iwqmnfn3tkdn', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:49.277', NULL, NULL, NULL),
('cmszpc5o0000biwqmv1r9rpd8', 'role.delete', 'Role', 'cmszpc5n30008iwqmnfn3tkdn', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:49.296', NULL, NULL, NULL),
('cmszpc5o5000ciwqm7h32wk7k', 'setting.update', 'SystemSetting', 'e2e.test.1787120388323', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:49.301', NULL, NULL, NULL),
('cmszpc7ky0006iwqmessav2ov', 'organization.credits_adjust', 'CreditWallet', 'cmszpc7ks0004iwqmkzghbx7s', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:51.778', NULL, NULL, NULL),
('cmszpc7r00008iwqm6xdb1ars', 'user.create', 'User', 'cmszpc7qw0007iwqmh926wqrt', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:51.996', NULL, NULL, NULL),
('cmszpc8ds0008iwqmszpe9d49', 'automation.create', 'Automation', 'cmszpc8do0007iwqmohqjf0w1', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:52.816', NULL, NULL, NULL),
('cmszpc8k4000eiwqmlngvlnug', 'automation.create', 'Automation', 'cmszpc8k1000diwqm83os3tef', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:53.044', NULL, NULL, NULL),
('cmszpc8n5000giwqmwqbfscve', 'automation.update', 'Automation', 'cmszpc8do0007iwqmohqjf0w1', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:53.153', NULL, NULL, NULL),
('cmszpc8nb000hiwqmdu8rud8h', 'automation.delete', 'Automation', 'cmszpc8do0007iwqmohqjf0w1', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:53.159', NULL, NULL, NULL),
('cmszpc9dz0006iwqmujmmbo1f', 'organization.credits_adjust', 'CreditWallet', 'cmszpc9dj0004iwqmn77dbz1a', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:54.119', NULL, NULL, NULL),
('cmszpc9ee0008iwqmja78ojk7', 'organization.credits_adjust', 'CreditWallet', 'cmszpc9dj0004iwqmn77dbz1a', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:54.134', NULL, NULL, NULL),
('cmszpcde6000biwqmho1dawel', 'organization.credits_adjust', 'CreditWallet', 'cmszpcdd40009iwqmathqd2c5', NULL, '::ffff:127.0.0.1', '2026-08-19 06:19:59.310', NULL, NULL, NULL),
('cmszpgbhg000eokqm80ckgwde', 'role.update', 'Role', 'cmsuew6i30002p4qmn8h155or', NULL, '::1', '2026-08-19 06:23:03.460', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszpgknr000hokqmy4fzk2lq', 'role.update', 'Role', 'cmsuew6i30002p4qmn8h155or', NULL, '::1', '2026-08-19 06:23:15.351', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszpgqr4000kokqmihvf71zf', 'campaign.delete', 'Campaign', 'cmsz058hr0008ooqmrjsy3pql', NULL, '::1', '2026-08-19 06:23:23.248', 'cmsyx4vjg0004dcqmxk4wp1mx', NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmszptlvj0001coqm8yj366my', 'setting.update', 'SystemSetting', 'branding.appName', NULL, '::1', '2026-08-19 06:33:23.455', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszptlwn0002coqmafb2mlwt', 'setting.update', 'SystemSetting', 'branding.supportContact', NULL, '::1', '2026-08-19 06:33:23.495', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszptunk0004coqmbzlkjved', 'setting.update', 'SystemSetting', 'branding.appName', NULL, '::1', '2026-08-19 06:33:34.832', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszptuos0005coqmg61hcytc', 'setting.update', 'SystemSetting', 'branding.supportContact', NULL, '::1', '2026-08-19 06:33:34.876', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszpv3su00040sqm2gv2s0mg', 'setting.update', 'SystemSetting', 'branding.appName', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:33.342', NULL, NULL, NULL),
('cmszpv3sz00050sqms95zwz6e', 'setting.update', 'SystemSetting', 'branding.supportContact', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:33.347', NULL, NULL, NULL),
('cmszpv3tc00060sqmt2jknbck', 'setting.update', 'SystemSetting', 'branding.supportContact', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:33.360', NULL, NULL, NULL),
('cmszpveyo000e6gqm6moigyil', 'campaign.launch', 'Campaign', 'cmszpvex400096gqmnwz2ky1w', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:47.808', NULL, NULL, NULL),
('cmszpvf4h000l6gqmzoykm96z', 'campaign.relaunch', 'Campaign', 'cmszpvf3z000g6gqml8lpzu87', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:48.017', NULL, NULL, NULL),
('cmszpvfdq000r6gqmet84s4o3', 'campaign.launch', 'Campaign', 'cmszpvfdb000n6gqm58ng24rz', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:48.350', NULL, NULL, NULL),
('cmszpvg8m000w6gqm9le59hwk', 'campaign.launch', 'Campaign', 'cmszpvg87000s6gqmnixzzebj', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:49.462', NULL, NULL, NULL),
('cmszpvg8t000x6gqmkx6l39z5', 'campaign.pause', 'Campaign', 'cmszpvg87000s6gqmnixzzebj', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:49.469', NULL, NULL, NULL),
('cmszpvg91000y6gqmknzs1f53', 'campaign.resume', 'Campaign', 'cmszpvg87000s6gqmnixzzebj', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:49.477', NULL, NULL, NULL),
('cmszpvgia00136gqmnyo66naz', 'campaign.launch', 'Campaign', 'cmszpvghv000z6gqmfa8bohhe', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:49.810', NULL, NULL, NULL),
('cmszpvgii00146gqm16qsnaff', 'campaign.cancel', 'Campaign', 'cmszpvghv000z6gqmfa8bohhe', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:49.818', NULL, NULL, NULL),
('cmszpvgiy00176gqmi89x8u6y', 'campaign.launch', 'Campaign', 'cmszpvgin00156gqmybc6w7ve', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:49.834', NULL, NULL, NULL),
('cmszpvgj700186gqmy3fih8ol', 'campaign.emergency_stop', NULL, NULL, NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:49.843', NULL, NULL, NULL),
('cmszpvgjl001a6gqmq86821r3', 'campaign.delete', 'Campaign', 'cmszpvgjd00196gqm8w0nr8w9', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:49.857', NULL, NULL, NULL),
('cmszpvgph001c6gqme14tq32h', 'user.create', 'User', 'cmszpvgpc001b6gqmdyhqm4ve', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:50.069', NULL, NULL, NULL),
('cmszpvhni00046gqm5aow0x01', 'setting.update', 'SystemSetting', 'branding.appName', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:51.294', NULL, NULL, NULL),
('cmszpvhno00056gqmkv7gqj03', 'setting.update', 'SystemSetting', 'branding.supportContact', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:51.300', NULL, NULL, NULL),
('cmszpvhny00066gqmotdpysv7', 'setting.update', 'SystemSetting', 'branding.supportContact', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:51.310', NULL, NULL, NULL),
('cmszpvilu00066gqmu1ioplg7', 'organization.create', 'Organization', 'cmszpvilo00046gqmxjds1wm7', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:52.530', NULL, NULL, NULL),
('cmszpvitj000a6gqmbzphi6o7', 'organization.update', 'Organization', 'cmszpvilo00046gqmxjds1wm7', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:52.807', NULL, NULL, NULL),
('cmszpvitr000b6gqmio6t86dz', 'organization.modules_update', 'Organization', 'cmszpvilo00046gqmxjds1wm7', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:52.815', NULL, NULL, NULL),
('cmszpvity000c6gqmmn51arsq', 'organization.modules_update', 'Organization', 'cmszpvilo00046gqmxjds1wm7', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:52.822', NULL, NULL, NULL),
('cmszpviu4000d6gqmhozrdvs0', 'organization.service_toggle', 'Organization', 'cmszpvilo00046gqmxjds1wm7', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:52.828', NULL, NULL, NULL),
('cmszpviub000e6gqmlg6nog4j', 'organization.impersonate', 'Organization', 'cmszpvilo00046gqmxjds1wm7', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:52.835', NULL, NULL, NULL),
('cmszpviun000f6gqmkvrdp5we', 'organization.service_toggle', 'Organization', 'cmszpvilo00046gqmxjds1wm7', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:52.847', NULL, NULL, NULL),
('cmszpviut000g6gqm9ozdzuw3', 'organization.impersonate', 'Organization', 'cmszpvilo00046gqmxjds1wm7', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:52.853', NULL, NULL, NULL),
('cmszpvjcd000k6gqm3nmpv4b9', 'organization.user_password_reset', 'Organization', 'cmszpvilo00046gqmxjds1wm7', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:53.485', NULL, NULL, NULL),
('cmszpvji9000m6gqmwriwb1kd', 'organization.suspend', 'Organization', 'cmszpvilo00046gqmxjds1wm7', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:53.697', NULL, NULL, NULL),
('cmszpvjig000n6gqm4r0e9p0i', 'organization.impersonate', 'Organization', 'cmszpvilo00046gqmxjds1wm7', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:53.704', NULL, NULL, NULL),
('cmszpvjio000o6gqmw9hz3y3v', 'organization.activate', 'Organization', 'cmszpvilo00046gqmxjds1wm7', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:53.712', NULL, NULL, NULL),
('cmszpvjow000u6gqmypbps8c8', 'organization.create', 'Organization', 'cmszpvjom000q6gqmwfaq8ltv', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:53.936', NULL, NULL, NULL),
('cmszpvjpb000v6gqm1k9ywug1', 'organization.update', 'Organization', 'cmszpvjom000q6gqmwfaq8ltv', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:53.951', NULL, NULL, NULL),
('cmszpvjpl000w6gqmquik42up', 'organization.update', 'Organization', 'cmszpvjom000q6gqmwfaq8ltv', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:53.961', NULL, NULL, NULL),
('cmszpvjq1000z6gqmnigzikhs', 'organization.update', 'Organization', 'cmszpvjom000q6gqmwfaq8ltv', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:53.977', NULL, NULL, NULL),
('cmszpvjwb00156gqme66c8q4l', 'organization.create', 'Organization', 'cmszpvjw300116gqmt7builty', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:54.203', NULL, NULL, NULL),
('cmszpvjwk00166gqmecj13cgo', 'organization.update', 'Organization', 'cmszpvjw300116gqmt7builty', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:54.212', NULL, NULL, NULL),
('cmszpvjwt00176gqm2xzp8jiz', 'organization.update', 'Organization', 'cmszpvjw300116gqmt7builty', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:54.221', NULL, NULL, NULL),
('cmszpvjx5001a6gqm155n0f2b', 'organization.update', 'Organization', 'cmszpvjw300116gqmt7builty', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:54.233', NULL, NULL, NULL),
('cmszpvk35001d6gqmb5zj18ur', 'organization.create', 'Organization', 'cmszpvk31001b6gqmuf99von3', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:54.449', NULL, NULL, NULL),
('cmszpvk3a001e6gqm03xx12wb', 'organization.modules_update', 'Organization', 'cmszpvk31001b6gqmuf99von3', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:54.454', NULL, NULL, NULL),
('cmszpvk3g001f6gqmfy51sdlg', 'organization.impersonate', 'Organization', 'cmszpvk31001b6gqmuf99von3', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:54.460', NULL, NULL, NULL),
('cmszpvn0z00056gqmtg8irxnf', 'user.create', 'User', 'cmszpvn0v00046gqmb21q3isz', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:58.259', NULL, NULL, NULL),
('cmszpvndk00096gqmen4eifek', 'user.create', 'User', 'cmszpvndg00086gqmgpmkaryg', NULL, '::ffff:127.0.0.1', '2026-08-19 06:34:58.712', NULL, NULL, NULL),
('cmszpvogz00036gqm3kd6pzxz', 'user.create', 'User', 'cmszpvogu00026gqmtq3ci7le', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:00.131', NULL, NULL, NULL),
('cmszpvpv2000a6gqm11or31e4', 'organization.credits_adjust', 'CreditWallet', 'cmszpvpuk00076gqmoovxi1ml', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:01.934', NULL, NULL, NULL),
('cmszpvpvy000d6gqml454e478', 'organization.credits_adjust', 'CreditWallet', 'cmszpvpup00086gqm0z87d0d8', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:01.966', NULL, NULL, NULL),
('cmszpvry500056gqmzf35du2r', 'plan.create', 'Plan', 'cmszpvry200046gqmi5rsjg6q', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:04.637', NULL, NULL, NULL),
('cmszpvryi00066gqm5pyjob2e', 'plan.update', 'Plan', 'cmszpvry200046gqmi5rsjg6q', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:04.650', NULL, NULL, NULL),
('cmszpvsa9000a6gqm2wlt9l0n', 'plan.delete', 'Plan', 'cmszpvry200046gqmi5rsjg6q', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:05.073', NULL, NULL, NULL),
('cmszpvt6g00056gqmrgklr9wq', 'user.create', 'User', 'cmszpvt6c00046gqm5bofjwap', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:06.232', NULL, NULL, NULL),
('cmszpvtch00076gqm8zhja3pm', 'user.create', 'User', 'cmszpvtce00066gqmvwgrpau0', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:06.449', NULL, NULL, NULL),
('cmszpvtd500086gqm1bdj0m8o', 'user.update', 'User', 'cmszpvsom00016gqmd0yqabpn', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:06.473', NULL, NULL, NULL),
('cmszpvu5200046gqmxqjl9te2', 'user.create', 'User', 'cmszpvu4y00036gqmq2gvr5tp', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:07.478', NULL, NULL, NULL),
('cmszpvuzp00026gqm3mp8796d', 'user.create', 'User', 'cmszpvuzl00016gqmcmf3renh', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:08.581', NULL, NULL, NULL),
('cmszpvv0000036gqm8ttmx5l6', 'user.update', 'User', 'cmszpvuzl00016gqmcmf3renh', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:08.592', NULL, NULL, NULL),
('cmszpvv5q00046gqm316edokg', 'user.password_reset', 'User', 'cmszpvuzl00016gqmcmf3renh', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:08.798', NULL, NULL, NULL),
('cmszpvvbk00066gqmnqr1v15j', 'user.update', 'User', 'cmszpvuzl00016gqmcmf3renh', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:09.008', NULL, NULL, NULL),
('cmszpvvbx00076gqmg487ifik', 'user.delete', 'User', 'cmszpvuzl00016gqmcmf3renh', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:09.021', NULL, NULL, NULL),
('cmszpvvck00096gqmgyyc6e3q', 'role.create', 'Role', 'cmszpvvcf00086gqmtraulf05', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:09.044', NULL, NULL, NULL),
('cmszpvvcu000a6gqm3r848abc', 'role.update', 'Role', 'cmszpvvcf00086gqmtraulf05', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:09.054', NULL, NULL, NULL),
('cmszpvvd6000b6gqmq1d5bz2w', 'role.delete', 'Role', 'cmszpvvcf00086gqmtraulf05', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:09.066', NULL, NULL, NULL),
('cmszpvvdb000c6gqm2ckyrqxk', 'setting.update', 'SystemSetting', 'e2e.test.1787121308098', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:09.071', NULL, NULL, NULL),
('cmszpvw8g00066gqm0svqyrsv', 'organization.credits_adjust', 'CreditWallet', 'cmszpvw8a00046gqm8urdfl6g', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:10.192', NULL, NULL, NULL),
('cmszpvweh00086gqmk2q83o70', 'user.create', 'User', 'cmszpvwed00076gqmlk958zbp', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:10.409', NULL, NULL, NULL),
('cmszpvx0l00086gqm1nsloti3', 'automation.create', 'Automation', 'cmszpvx0h00076gqmdk9q1pvy', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:11.205', NULL, NULL, NULL),
('cmszpvx6v000e6gqmu9h4na0h', 'automation.create', 'Automation', 'cmszpvx6t000d6gqmp6mnr5xu', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:11.431', NULL, NULL, NULL),
('cmszpvx9w000g6gqmny5vum2k', 'automation.update', 'Automation', 'cmszpvx0h00076gqmdk9q1pvy', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:11.540', NULL, NULL, NULL),
('cmszpvxa2000h6gqmnudcvk1p', 'automation.delete', 'Automation', 'cmszpvx0h00076gqmdk9q1pvy', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:11.546', NULL, NULL, NULL),
('cmszpvy2w000b6gqm1zgfr9ms', 'organization.credits_adjust', 'CreditWallet', 'cmszpvy1u00096gqmzqbcdw7s', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:12.584', NULL, NULL, NULL),
('cmszpvyyz00066gqmpya8cy61', 'organization.credits_adjust', 'CreditWallet', 'cmszpvyyi00046gqmlustzcvf', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:13.739', NULL, NULL, NULL),
('cmszpvyze00086gqmemx8tye8', 'organization.credits_adjust', 'CreditWallet', 'cmszpvyyi00046gqmlustzcvf', NULL, '::ffff:127.0.0.1', '2026-08-19 06:35:13.754', NULL, NULL, NULL),
('cmszpyxkb000acoqmnp7o0drb', 'setting.update', 'SystemSetting', 'branding.appName', NULL, '::1', '2026-08-19 06:37:31.883', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszpyxke000bcoqm8iq9oisy', 'setting.update', 'SystemSetting', 'branding.supportContact', NULL, '::1', '2026-08-19 06:37:31.886', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszpzrd6000icoqmgjdr3zhr', 'setting.update', 'SystemSetting', 'branding.supportContact', NULL, '::1', '2026-08-19 06:38:10.506', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL),
('cmszpzrd6000jcoqm7rumomhp', 'setting.update', 'SystemSetting', 'branding.appName', NULL, '::1', '2026-08-19 06:38:10.506', 'cmsyoqerv0000o0qmpe1j1ox3', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `automation`
--

CREATE TABLE `automation` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `triggerType` varchar(191) NOT NULL,
  `triggerConfig` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`triggerConfig`)),
  `actionType` varchar(191) NOT NULL,
  `actionConfig` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`actionConfig`)),
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `organizationId` varchar(191) NOT NULL,
  `createdByUserId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `campaign`
--

CREATE TABLE `campaign` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `status` enum('DRAFT','SCHEDULED','RUNNING','PAUSED','COMPLETED','CANCELLED','FAILED') NOT NULL DEFAULT 'DRAFT',
  `scheduledAt` datetime(3) DEFAULT NULL,
  `startedAt` datetime(3) DEFAULT NULL,
  `completedAt` datetime(3) DEFAULT NULL,
  `minDelaySeconds` int(11) NOT NULL DEFAULT 5,
  `maxDelaySeconds` int(11) NOT NULL DEFAULT 15,
  `dailyLimit` int(11) DEFAULT NULL,
  `concurrency` int(11) NOT NULL DEFAULT 1,
  `retryLimit` int(11) NOT NULL DEFAULT 2,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `organizationId` varchar(191) NOT NULL,
  `templateId` varchar(191) NOT NULL,
  `whatsAppAccountId` varchar(191) NOT NULL,
  `createdByUserId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `campaign`
--

INSERT INTO `campaign` (`id`, `name`, `status`, `scheduledAt`, `startedAt`, `completedAt`, `minDelaySeconds`, `maxDelaySeconds`, `dailyLimit`, `concurrency`, `retryLimit`, `createdAt`, `updatedAt`, `organizationId`, `templateId`, `whatsAppAccountId`, `createdByUserId`) VALUES
('cmsyzkqop000vosqmfsnecpvi', 'Test campign', 'COMPLETED', NULL, '2026-08-18 18:20:19.621', '2026-08-18 18:20:19.798', 5, 15, NULL, 1, 2, '2026-08-18 18:18:39.769', '2026-08-18 18:20:19.799', 'cmsyx4vjb0003dcqmx0x9ptmg', 'cmsyziaq2000nosqm5ci4zcje', 'cmsyzjt6f000sosqmvxiomj5m', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzs98e001bosqmwm28fbpr', 'Testing campign', 'COMPLETED', NULL, '2026-08-18 18:24:36.908', '2026-08-18 18:24:37.711', 5, 15, NULL, 1, 2, '2026-08-18 18:24:30.398', '2026-08-18 18:24:37.713', 'cmsyx4vjb0003dcqmx0x9ptmg', 'cmsyziaq2000nosqm5ci4zcje', 'cmsyzjt6f000sosqmvxiomj5m', 'cmsyx4vjg0004dcqmxk4wp1mx');

-- --------------------------------------------------------

--
-- Table structure for table `campaignrecipient`
--

CREATE TABLE `campaignrecipient` (
  `id` varchar(191) NOT NULL,
  `status` enum('PENDING','QUEUED','SENDING','SENT','DELIVERED','READ','FAILED','SKIPPED_OPTOUT','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `attempts` int(11) NOT NULL DEFAULT 0,
  `errorMessage` varchar(191) DEFAULT NULL,
  `scheduledFor` datetime(3) DEFAULT NULL,
  `sentAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `campaignId` varchar(191) NOT NULL,
  `contactId` varchar(191) NOT NULL,
  `messageId` varchar(191) DEFAULT NULL,
  `organizationId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `campaignrecipient`
--

INSERT INTO `campaignrecipient` (`id`, `status`, `attempts`, `errorMessage`, `scheduledFor`, `sentAt`, `createdAt`, `updatedAt`, `campaignId`, `contactId`, `messageId`, `organizationId`) VALUES
('cmsyzmtn00011osqmm6up4616', 'FAILED', 1, 'WhatsApp account is not connected', '2026-08-18 18:20:19.626', NULL, '2026-08-18 18:20:16.908', '2026-08-18 18:20:19.793', 'cmsyzkqop000vosqmfsnecpvi', 'cmsyzlj8n000xosqmgf923vf4', 'cmsyzmvum0002h0qm8al5f6qy', 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzmtn00012osqmwnrhxszq', 'FAILED', 1, 'WhatsApp account is not connected', '2026-08-18 18:20:19.626', NULL, '2026-08-18 18:20:16.908', '2026-08-18 18:20:19.795', 'cmsyzkqop000vosqmfsnecpvi', 'cmsyzlwjq000yosqm5qk2zk2w', 'cmsyzmvuq0003h0qmqhf9rurm', 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzsdd2001cosqm0miq6maw', 'SENT', 0, NULL, '2026-08-18 18:24:36.910', '2026-08-18 18:24:37.484', '2026-08-18 18:24:35.750', '2026-08-18 18:24:37.486', 'cmsyzs98e001bosqmwm28fbpr', 'cmsyzlj8n000xosqmgf923vf4', 'cmsyzsei8001fosqmwr9inyys', 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzsdd2001dosqmkj2o6jl3', 'SENT', 0, NULL, '2026-08-18 18:24:36.910', '2026-08-18 18:24:37.704', '2026-08-18 18:24:35.750', '2026-08-18 18:24:37.706', 'cmsyzs98e001bosqmwm28fbpr', 'cmsyzlwjq000yosqm5qk2zk2w', 'cmsyzsei8001gosqmc8yuxngy', 'cmsyx4vjb0003dcqmx0x9ptmg');

-- --------------------------------------------------------

--
-- Table structure for table `contact`
--

CREATE TABLE `contact` (
  `id` varchar(191) NOT NULL,
  `firstName` varchar(191) NOT NULL,
  `lastName` varchar(191) DEFAULT NULL,
  `phoneNumber` varchar(191) NOT NULL,
  `avatarUrl` varchar(191) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `source` varchar(191) DEFAULT NULL,
  `isOptedOut` tinyint(1) NOT NULL DEFAULT 0,
  `optedOutAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `organizationId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact`
--

INSERT INTO `contact` (`id`, `firstName`, `lastName`, `phoneNumber`, `avatarUrl`, `notes`, `source`, `isOptedOut`, `optedOutAt`, `createdAt`, `updatedAt`, `organizationId`) VALUES
('cmsyzlj8n000xosqmgf923vf4', 'pubg', 'lovers', '+918441098140', NULL, NULL, NULL, 1, '2026-08-19 05:37:59.268', '2026-08-18 18:19:16.775', '2026-08-19 05:37:59.270', 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzlwjq000yosqm5qk2zk2w', 'Meena', 'lovers', '+916377720778', NULL, NULL, NULL, 0, NULL, '2026-08-18 18:19:34.022', '2026-08-18 18:19:34.022', 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsznq3zj0004dcqmr3g3mhln', 'Bulk1', NULL, '+919990000001', NULL, NULL, NULL, 0, NULL, '2026-08-19 05:34:41.071', '2026-08-19 05:34:41.071', 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsznq4160005dcqmupjzw7g6', 'Bulk2', NULL, '+919990000002', NULL, NULL, NULL, 0, NULL, '2026-08-19 05:34:41.130', '2026-08-19 05:34:41.130', 'cmsyx4vjb0003dcqmx0x9ptmg');

-- --------------------------------------------------------

--
-- Table structure for table `conversation`
--

CREATE TABLE `conversation` (
  `id` varchar(191) NOT NULL,
  `unreadCount` int(11) NOT NULL DEFAULT 0,
  `lastMessageAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `whatsAppAccountId` varchar(191) NOT NULL,
  `contactId` varchar(191) NOT NULL,
  `assignedToUserId` varchar(191) DEFAULT NULL,
  `organizationId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `conversation`
--

INSERT INTO `conversation` (`id`, `unreadCount`, `lastMessageAt`, `createdAt`, `updatedAt`, `whatsAppAccountId`, `contactId`, `assignedToUserId`, `organizationId`) VALUES
('cmsyzmvu30000h0qmu13cgjzf', 0, '2026-08-18 18:34:36.751', '2026-08-18 18:20:19.755', '2026-08-19 06:38:50.387', 'cmsyzjt6f000sosqmvxiomj5m', 'cmsyzlj8n000xosqmgf923vf4', NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzmvu50001h0qm54mzcrnl', 0, '2026-08-18 18:34:36.762', '2026-08-18 18:20:19.757', '2026-08-18 18:34:36.768', 'cmsyzjt6f000sosqmvxiomj5m', 'cmsyzlwjq000yosqm5qk2zk2w', NULL, 'cmsyx4vjb0003dcqmx0x9ptmg');

-- --------------------------------------------------------

--
-- Table structure for table `credittransaction`
--

CREATE TABLE `credittransaction` (
  `id` varchar(191) NOT NULL,
  `type` enum('CREDIT','DEBIT') NOT NULL,
  `amount` int(11) NOT NULL,
  `reason` varchar(191) NOT NULL,
  `referenceType` varchar(191) DEFAULT NULL,
  `referenceId` varchar(191) DEFAULT NULL,
  `balanceAfter` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `walletId` varchar(191) NOT NULL,
  `createdByUserId` varchar(191) DEFAULT NULL,
  `organizationId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `credittransaction`
--

INSERT INTO `credittransaction` (`id`, `type`, `amount`, `reason`, `referenceType`, `referenceId`, `balanceAfter`, `createdAt`, `walletId`, `createdByUserId`, `organizationId`) VALUES
('cmsyxlems0003j8qmnifspc9m', 'CREDIT', 1000, 'Plan assigned: Starter Plan', NULL, NULL, 1000, '2026-08-18 17:23:11.572', 'cmsyx59p20007dcqmvg6j64tu', 'cmsyoqerv0000o0qmpe1j1ox3', 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzrap30019osqm5ziy5r4t', 'DEBIT', 1, 'WhatsApp message sent', 'Message', 'cmsyzra4p0018osqm0k6sp1mw', 999, '2026-08-18 18:23:45.639', 'cmsyx59p20007dcqmvg6j64tu', NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzsep2001hosqmvobow8ly', 'DEBIT', 1, 'WhatsApp message sent', 'Message', 'cmsyzsei8001fosqmwr9inyys', 998, '2026-08-18 18:24:37.478', 'cmsyx59p20007dcqmvg6j64tu', NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzsev6001iosqma2xiot8p', 'DEBIT', 1, 'WhatsApp message sent', 'Message', 'cmsyzsei8001gosqmc8yuxngy', 997, '2026-08-18 18:24:37.698', 'cmsyx59p20007dcqmvg6j64tu', NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzvfo3001uosqmom3rh26j', 'CREDIT', 2000, 'Plan assigned: Medium Plan', NULL, NULL, 2997, '2026-08-18 18:26:58.707', 'cmsyx59p20007dcqmvg6j64tu', 'cmsyoqerv0000o0qmpe1j1ox3', 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsz0593b000eooqmp5l4hvbm', 'DEBIT', 1, 'WhatsApp message sent', 'Message', 'cmsz058lq000cooqmiel0c76j', 2996, '2026-08-18 18:34:36.743', 'cmsyx59p20007dcqmvg6j64tu', NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsz0593n000fooqmxfj8ax6s', 'DEBIT', 1, 'WhatsApp message sent', 'Message', 'cmsz058lq000dooqmtuf23q41', 2995, '2026-08-18 18:34:36.755', 'cmsyx59p20007dcqmvg6j64tu', NULL, 'cmsyx4vjb0003dcqmx0x9ptmg');

-- --------------------------------------------------------

--
-- Table structure for table `creditwallet`
--

CREATE TABLE `creditwallet` (
  `id` varchar(191) NOT NULL,
  `balance` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `organizationId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `creditwallet`
--

INSERT INTO `creditwallet` (`id`, `balance`, `createdAt`, `updatedAt`, `organizationId`) VALUES
('cmsyx59p20007dcqmvg6j64tu', 2995, '2026-08-18 17:10:38.678', '2026-08-18 18:34:36.749', 'cmsyx4vjb0003dcqmx0x9ptmg');

-- --------------------------------------------------------

--
-- Table structure for table `list`
--

CREATE TABLE `list` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `organizationId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `list`
--

INSERT INTO `list` (`id`, `name`, `description`, `createdAt`, `updatedAt`, `organizationId`) VALUES
('cmsyzl8ak000wosqm1vnc06cy', 'Testing LIst', NULL, '2026-08-18 18:19:02.588', '2026-08-18 18:19:02.588', 'cmsyx4vjb0003dcqmx0x9ptmg');

-- --------------------------------------------------------

--
-- Table structure for table `listmember`
--

CREATE TABLE `listmember` (
  `id` varchar(191) NOT NULL,
  `addedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `listId` varchar(191) NOT NULL,
  `contactId` varchar(191) NOT NULL,
  `organizationId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `listmember`
--

INSERT INTO `listmember` (`id`, `addedAt`, `listId`, `contactId`, `organizationId`) VALUES
('cmsyzm3n9000zosqmpmdqz216', '2026-08-18 18:19:43.221', 'cmsyzl8ak000wosqm1vnc06cy', 'cmsyzlwjq000yosqm5qk2zk2w', 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzm89v0010osqmjbng8boy', '2026-08-18 18:19:49.219', 'cmsyzl8ak000wosqm1vnc06cy', 'cmsyzlj8n000xosqmgf923vf4', 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmszntqen000qdcqmd3izh4vy', '2026-08-19 05:37:30.096', 'cmsyzl8ak000wosqm1vnc06cy', 'cmsznq4160005dcqmupjzw7g6', 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmszntqeo000rdcqmif7apzz1', '2026-08-19 05:37:30.096', 'cmsyzl8ak000wosqm1vnc06cy', 'cmsznq3zj0004dcqmr3g3mhln', 'cmsyx4vjb0003dcqmx0x9ptmg');

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE `media` (
  `id` varchar(191) NOT NULL,
  `type` enum('IMAGE','VIDEO','AUDIO','DOCUMENT') NOT NULL,
  `filePath` varchar(191) NOT NULL,
  `fileName` varchar(191) NOT NULL,
  `mimeType` varchar(191) NOT NULL,
  `sizeBytes` int(11) NOT NULL,
  `checksum` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `uploadedByUserId` varchar(191) DEFAULT NULL,
  `organizationId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `id` varchar(191) NOT NULL,
  `direction` enum('INBOUND','OUTBOUND') NOT NULL,
  `type` enum('TEXT','IMAGE','VIDEO','AUDIO','DOCUMENT','TEMPLATE') NOT NULL,
  `content` text DEFAULT NULL,
  `status` enum('PENDING','SENT','DELIVERED','READ','FAILED') NOT NULL DEFAULT 'PENDING',
  `waMessageId` varchar(191) DEFAULT NULL,
  `errorMessage` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `conversationId` varchar(191) NOT NULL,
  `whatsAppAccountId` varchar(191) NOT NULL,
  `mediaId` varchar(191) DEFAULT NULL,
  `sentByUserId` varchar(191) DEFAULT NULL,
  `organizationId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `message`
--

INSERT INTO `message` (`id`, `direction`, `type`, `content`, `status`, `waMessageId`, `errorMessage`, `createdAt`, `updatedAt`, `conversationId`, `whatsAppAccountId`, `mediaId`, `sentByUserId`, `organizationId`) VALUES
('cmsyzmvum0002h0qm8al5f6qy', 'OUTBOUND', 'TEXT', 'Hey pubg 🙌\n\nTo get started, could you tell us a little about what brings you here today?\n\nReply for further assistance or speak to our expert 🤝🎁', 'FAILED', NULL, 'WhatsApp account is not connected', '2026-08-18 18:20:19.774', '2026-08-18 18:20:19.785', 'cmsyzmvu30000h0qmu13cgjzf', 'cmsyzjt6f000sosqmvxiomj5m', NULL, NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzmvuq0003h0qmqhf9rurm', 'OUTBOUND', 'TEXT', 'Hey Meena 🙌\n\nTo get started, could you tell us a little about what brings you here today?\n\nReply for further assistance or speak to our expert 🤝🎁', 'FAILED', NULL, 'WhatsApp account is not connected', '2026-08-18 18:20:19.778', '2026-08-18 18:20:19.787', 'cmsyzmvu50001h0qm54mzcrnl', 'cmsyzjt6f000sosqmvxiomj5m', NULL, NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzra4p0018osqm0k6sp1mw', 'OUTBOUND', 'TEXT', 'Hii', 'READ', '3EB05BD243AFC96CBF1E8C', NULL, '2026-08-18 18:23:44.905', '2026-08-18 18:23:57.706', 'cmsyzmvu50001h0qm54mzcrnl', 'cmsyzjt6f000sosqmvxiomj5m', NULL, 'cmsyx4vjg0004dcqmxk4wp1mx', 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzrosd001aosqmlew21ecl', 'INBOUND', 'TEXT', 'Haa', 'READ', 'AC83BB71232254DEC6245DA8F046E829', NULL, '2026-08-18 18:24:03.901', '2026-08-18 18:29:35.257', 'cmsyzmvu50001h0qm54mzcrnl', 'cmsyzjt6f000sosqmvxiomj5m', NULL, NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzsei8001fosqmwr9inyys', 'OUTBOUND', 'TEXT', 'Hey pubg 🙌\n\nTo get started, could you tell us a little about what brings you here today?\n\nReply for further assistance or speak to our expert 🤝🎁', 'SENT', '3EB0E0891E45058A7D2FFE', NULL, '2026-08-18 18:24:37.232', '2026-08-18 18:24:38.477', 'cmsyzmvu30000h0qmu13cgjzf', 'cmsyzjt6f000sosqmvxiomj5m', NULL, NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzsei8001gosqmc8yuxngy', 'OUTBOUND', 'TEXT', 'Hey Meena 🙌\n\nTo get started, could you tell us a little about what brings you here today?\n\nReply for further assistance or speak to our expert 🤝🎁', 'READ', '3EB0ABFBF9E005493738FC', NULL, '2026-08-18 18:24:37.232', '2026-08-18 18:24:48.159', 'cmsyzmvu50001h0qm54mzcrnl', 'cmsyzjt6f000sosqmvxiomj5m', NULL, NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsyzt9at001rosqmw4wiz9rd', 'INBOUND', 'TEXT', '😏', 'READ', 'AC962994CAF734156988F3ACBB56E5F0', NULL, '2026-08-18 18:25:17.141', '2026-08-18 18:29:35.257', 'cmsyzmvu50001h0qm54mzcrnl', 'cmsyzjt6f000sosqmvxiomj5m', NULL, NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsz03nq70004h0qmyr2t14zs', 'OUTBOUND', 'TEXT', 'Hey pubg 🙌\n\nTo get started, could you tell us a little about what brings you here today?\n\nReply for further assistance or speak to our expert 🤝🎁', 'FAILED', NULL, 'WhatsApp account is not connected', '2026-08-18 18:33:22.399', '2026-08-18 18:33:22.402', 'cmsyzmvu30000h0qmu13cgjzf', 'cmsyzjt6f000sosqmvxiomj5m', NULL, NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsz03nq70005h0qmb1v0gvo5', 'OUTBOUND', 'TEXT', 'Hey Meena 🙌\n\nTo get started, could you tell us a little about what brings you here today?\n\nReply for further assistance or speak to our expert 🤝🎁', 'FAILED', NULL, 'WhatsApp account is not connected', '2026-08-18 18:33:22.399', '2026-08-18 18:33:22.402', 'cmsyzmvu50001h0qm54mzcrnl', 'cmsyzjt6f000sosqmvxiomj5m', NULL, NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsz058lq000cooqmiel0c76j', 'OUTBOUND', 'TEXT', 'Hey pubg 🙌\n\nTo get started, could you tell us a little about what brings you here today?\n\nReply for further assistance or speak to our expert 🤝🎁', 'SENT', '3EB01001B627EF17AA4F3A', NULL, '2026-08-18 18:34:36.110', '2026-08-19 05:27:43.779', 'cmsyzmvu30000h0qmu13cgjzf', 'cmsyzjt6f000sosqmvxiomj5m', NULL, NULL, 'cmsyx4vjb0003dcqmx0x9ptmg'),
('cmsz058lq000dooqmtuf23q41', 'OUTBOUND', 'TEXT', 'Hey Meena 🙌\n\nTo get started, could you tell us a little about what brings you here today?\n\nReply for further assistance or speak to our expert 🤝🎁', 'READ', '3EB09094994A66D03BE43A', NULL, '2026-08-18 18:34:36.110', '2026-08-19 05:27:44.556', 'cmsyzmvu50001h0qm54mzcrnl', 'cmsyzjt6f000sosqmvxiomj5m', NULL, NULL, 'cmsyx4vjb0003dcqmx0x9ptmg');

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `body` varchar(191) DEFAULT NULL,
  `link` varchar(191) DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `userId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organization`
--

CREATE TABLE `organization` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `enabledModules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`enabledModules`)),
  `planId` varchar(191) DEFAULT NULL,
  `serviceEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('ACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `campaignBatchIntervalMaxSeconds` int(11) NOT NULL DEFAULT 10,
  `campaignBatchIntervalMinSeconds` int(11) NOT NULL DEFAULT 5,
  `campaignBatchSize` int(11) NOT NULL DEFAULT 5,
  `planExpiresAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organization`
--

INSERT INTO `organization` (`id`, `name`, `createdAt`, `updatedAt`, `enabledModules`, `planId`, `serviceEnabled`, `status`, `campaignBatchIntervalMaxSeconds`, `campaignBatchIntervalMinSeconds`, `campaignBatchSize`, `planExpiresAt`) VALUES
('cmsyx4vjb0003dcqmx0x9ptmg', 'Go4Wallet', '2026-08-18 17:10:20.328', '2026-08-19 06:03:42.092', '{\"whatsapp\":true}', 'cmsyx7o84000adcqm6ipfrxsb', 1, 'ACTIVE', 10, 5, 5, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `permission`
--

CREATE TABLE `permission` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permission`
--

INSERT INTO `permission` (`id`, `key`, `description`) VALUES
('cb190e7b771c248e18b1dfc9c', 'campaigns.delete', NULL),
('cmsuew6hi0000p4qm1xqlr6v1', 'users.manage', NULL),
('cmsuew6hm0001p4qmn4ietp3o', 'roles.manage', NULL),
('cmsufxb7m0000s8qmg1as3j8v', 'whatsapp.manage', NULL),
('cmsugwvu70000fsqmg9thwzfs', 'contacts.manage', NULL),
('cmsugwvub0001fsqme9zrw2af', 'lists.manage', NULL),
('cmsuhorq10000ocqm4d1dpdsm', 'messages.manage', NULL),
('cmsui9tfy0000doqmmx9phxgz', 'templates.manage', NULL),
('cmsui9tg20001doqmbrwtbakt', 'campaigns.manage', NULL),
('cmsumvttz0000soqm0dsrnvi4', 'credits.manage', NULL),
('cmsuo18hg0000mwqmr9izu6ty', 'settings.manage', NULL),
('cmsuo18hj0001mwqmt254sjmj', 'analytics.view', NULL),
('cmsuooxxj0000bgqmt8ygsqd8', 'automations.manage', NULL),
('cmsuooxxl0001bgqmb5bbivbj', 'audit-logs.view', NULL),
('cmsydz06a0000ocqmuzkz4vsg', 'organizations.manage', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `plan`
--

CREATE TABLE `plan` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `credits` int(11) NOT NULL,
  `maxWhatsAppAccounts` int(11) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `durationDays` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `plan`
--

INSERT INTO `plan` (`id`, `name`, `credits`, `maxWhatsAppAccounts`, `isActive`, `createdAt`, `updatedAt`, `durationDays`) VALUES
('cmsyx77el0008dcqm41yz6qqm', 'Starter Plan', 1000, 2, 1, '2026-08-18 17:12:09.021', '2026-08-18 17:12:09.021', NULL),
('cmsyx7o84000adcqm6ipfrxsb', 'Medium Plan', 2000, 5, 1, '2026-08-18 17:12:30.820', '2026-08-18 17:12:30.820', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `refreshtoken`
--

CREATE TABLE `refreshtoken` (
  `id` varchar(191) NOT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `revokedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `userId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refreshtoken`
--

INSERT INTO `refreshtoken` (`id`, `userAgent`, `ipAddress`, `expiresAt`, `revokedAt`, `createdAt`, `userId`) VALUES
('cmsyoql7p000nckqmvvptvz0w', 'curl/8.6.0', '::1', '2026-08-25 13:15:16.836', '2026-08-19 06:30:00.235', '2026-08-18 13:15:16.837', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyot77f000ockqms3qi0wq6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 13:17:18.650', '2026-08-18 17:09:01.686', '2026-08-18 13:17:18.651', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyx0w6m0000dcqm638d6t7v', 'curl/8.6.0', '::1', '2026-08-25 17:07:14.531', '2026-08-19 06:30:00.235', '2026-08-18 17:07:14.542', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyx36v10001dcqmfqcrrpkm', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:09:01.692', '2026-08-18 17:13:54.493', '2026-08-18 17:09:01.693', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyx36v10002dcqmywc4s670', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:09:01.692', '2026-08-19 06:30:00.235', '2026-08-18 17:09:01.693', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyx59n60006dcqmp278l2dr', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:10:38.610', '2026-08-18 17:13:31.800', '2026-08-18 17:10:38.610', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyx8za4000fdcqmudqc71cr', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:13:31.804', NULL, '2026-08-18 17:13:31.804', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyx8za5000gdcqma5pgfnmg', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:13:31.805', '2026-08-18 17:13:36.876', '2026-08-18 17:13:31.805', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyx9374000hdcqma00cob40', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:13:36.879', NULL, '2026-08-18 17:13:36.880', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyx9374000idcqmpqbjykbs', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:13:36.880', '2026-08-18 17:13:58.768', '2026-08-18 17:13:36.880', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyx9gsg000ndcqm8du3ypef', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:13:54.495', '2026-08-19 06:30:00.235', '2026-08-18 17:13:54.496', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyx9gsh000odcqmhtj1i3x6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:13:54.496', '2026-08-18 17:34:01.099', '2026-08-18 17:13:54.497', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyx9k38000pdcqm3xlhb9da', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:13:58.771', NULL, '2026-08-18 17:13:58.772', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyx9k38000qdcqmc7yj0qjz', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:13:58.771', '2026-08-18 17:14:58.479', '2026-08-18 17:13:58.772', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxau5u000rdcqmbanb52kp', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:14:58.482', NULL, '2026-08-18 17:14:58.482', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxau5u000sdcqmcodf0p6v', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:14:58.482', '2026-08-18 17:14:59.043', '2026-08-18 17:14:58.482', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxaulj000tdcqmgngxo47d', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:14:59.046', NULL, '2026-08-18 17:14:59.047', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxaulj000udcqmjxxmyyxp', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:14:59.046', '2026-08-18 17:14:59.369', '2026-08-18 17:14:59.047', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxauul000vdcqmkhp292ps', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:14:59.373', NULL, '2026-08-18 17:14:59.373', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxauum000wdcqmazw9a1rj', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:14:59.373', '2026-08-18 17:14:59.705', '2026-08-18 17:14:59.374', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxav3x000xdcqm15p26t59', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:14:59.708', NULL, '2026-08-18 17:14:59.709', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxav3x000ydcqmo5nuk6a7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:14:59.709', '2026-08-18 17:14:59.910', '2026-08-18 17:14:59.709', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxav9l000zdcqmgp2fmo5r', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:14:59.912', NULL, '2026-08-18 17:14:59.913', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxav9m0010dcqmjesw07vd', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:14:59.914', '2026-08-18 17:15:00.144', '2026-08-18 17:14:59.914', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxavg20011dcqmvwz2kp80', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:00.146', NULL, '2026-08-18 17:15:00.146', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxavg30012dcqmwui5mrhe', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:00.147', '2026-08-18 17:15:00.329', '2026-08-18 17:15:00.147', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxavl80013dcqmwh4vewr1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:00.331', NULL, '2026-08-18 17:15:00.332', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxavl80014dcqmiffdekwv', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:00.332', '2026-08-18 17:15:00.494', '2026-08-18 17:15:00.332', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxavpt0015dcqm0b5v9517', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:00.496', NULL, '2026-08-18 17:15:00.497', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxavpu0016dcqmfhabfzu1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:00.497', '2026-08-18 17:15:00.680', '2026-08-18 17:15:00.498', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxavv00017dcqmun393vfy', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:00.683', NULL, '2026-08-18 17:15:00.684', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxavv00018dcqms8b95etv', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:00.684', '2026-08-18 17:15:00.972', '2026-08-18 17:15:00.684', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxaw330019dcqmyvpxfird', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:00.975', NULL, '2026-08-18 17:15:00.975', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxaw33001adcqm3x6kxeac', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:00.975', '2026-08-18 17:15:01.151', '2026-08-18 17:15:00.976', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxaw81001bdcqmj1wlawfs', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:01.153', NULL, '2026-08-18 17:15:01.153', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxaw83001cdcqm2dvirau8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:01.154', '2026-08-18 17:15:01.287', '2026-08-18 17:15:01.155', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxawbu001ddcqm349oulr2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:01.290', NULL, '2026-08-18 17:15:01.290', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxawbv001edcqmpv728sa5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:01.290', '2026-08-18 17:15:02.750', '2026-08-18 17:15:01.291', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxazgs001fdcqmy82m0erf', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:15:05.356', NULL, '2026-08-18 17:15:05.356', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxl6ya0000j8qmqny22a39', 'curl/8.6.0', '::1', '2026-08-25 17:23:01.608', '2026-08-19 06:30:00.235', '2026-08-18 17:23:01.618', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyxleje0001j8qmgpubjkm2', 'curl/8.6.0', '::1', '2026-08-25 17:23:11.449', '2026-08-19 06:30:00.235', '2026-08-18 17:23:11.450', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyxm9x70005j8qmf1bhohk9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:23:52.123', '2026-08-18 18:08:54.402', '2026-08-18 17:23:52.123', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyxzbtb0006j8qmchnj2wk7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 17:34:01.102', '2026-08-18 18:08:48.965', '2026-08-18 17:34:01.103', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyz82tq0000osqmeqfraaln', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:08:48.970', '2026-08-19 06:30:00.235', '2026-08-18 18:08:48.974', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyz82tr0001osqmm56upr70', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:08:48.974', '2026-08-18 18:25:59.952', '2026-08-18 18:08:48.975', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyz870m0002osqmigi1bhk3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:08:54.405', NULL, '2026-08-18 18:08:54.406', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyz870n0003osqmwepkjhc6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:08:54.406', '2026-08-18 18:12:55.856', '2026-08-18 18:08:54.407', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzdddj0004osqm7cnl9a4v', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:12:55.926', NULL, '2026-08-18 18:12:55.927', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzdddn0005osqm6ye92n16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:12:55.930', NULL, '2026-08-18 18:12:55.931', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzdddr0006osqmg4imey14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:12:55.933', '2026-08-18 18:15:45.085', '2026-08-18 18:12:55.935', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzgzwg0007osqml7ji8vyk', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:15:45.087', NULL, '2026-08-18 18:15:45.088', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzgzwh0008osqmq7pq3wd6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:15:45.088', '2026-08-18 18:15:45.629', '2026-08-18 18:15:45.089', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzh0bk0009osqmmhc5n4jq', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:15:45.632', NULL, '2026-08-18 18:15:45.632', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzh0bl000aosqmbap0pskb', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:15:45.633', '2026-08-18 18:15:45.825', '2026-08-18 18:15:45.633', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzh0h1000bosqm1ut99o6s', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:15:45.829', NULL, '2026-08-18 18:15:45.829', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzh0h2000cosqm3c4vfagp', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:15:45.830', '2026-08-18 18:15:45.994', '2026-08-18 18:15:45.830', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzh0lp000dosqmzf964fr7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:15:45.997', NULL, '2026-08-18 18:15:45.997', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzh0lr000eosqm0x3tp9i4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:15:45.998', '2026-08-18 18:15:46.139', '2026-08-18 18:15:45.999', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzh0pq000fosqmpkry5fwf', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:15:46.142', NULL, '2026-08-18 18:15:46.142', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzh0pr000gosqmlz4j70oh', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:15:46.142', '2026-08-18 18:16:40.314', '2026-08-18 18:15:46.143', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzhk0j000hosqmdpkpbdti', 'curl/8.6.0', '::1', '2026-08-25 18:16:11.153', '2026-08-19 06:30:00.235', '2026-08-18 18:16:11.155', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyzhp36000iosqm7onez2g8', 'curl/8.6.0', '::1', '2026-08-25 18:16:17.726', '2026-08-19 06:30:00.235', '2026-08-18 18:16:17.730', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyzi6il000losqm9dxxzx7h', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:16:40.317', NULL, '2026-08-18 18:16:40.317', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzi6in000mosqmnezuhugu', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:16:40.318', '2026-08-18 18:17:28.951', '2026-08-18 18:16:40.319', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzivyl000oosqml2hwelqd', 'curl/8.6.0', '::1', '2026-08-25 18:17:13.292', '2026-08-19 06:30:00.235', '2026-08-18 18:17:13.293', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyzj81m000qosqmvn49y8q1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:17:28.954', NULL, '2026-08-18 18:17:28.954', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzj81n000rosqmj3j310pk', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:17:28.954', '2026-08-18 18:20:26.355', '2026-08-18 18:17:28.955', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzn0xj0014osqmo2ri3gpw', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:20:26.359', NULL, '2026-08-18 18:20:26.359', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzn0xl0015osqm5nsvnu52', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:20:26.361', '2026-08-18 18:22:54.427', '2026-08-18 18:20:26.361', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzq76m0016osqmblsnkqf9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:22:54.429', NULL, '2026-08-18 18:22:54.430', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzq76n0017osqm2wolzvi1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:22:54.431', '2026-08-18 18:24:40.559', '2026-08-18 18:22:54.431', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzsh2r001josqml5dqoq4y', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:24:40.562', NULL, '2026-08-18 18:24:40.563', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzsh2s001kosqm2zu6cp13', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:24:40.563', '2026-08-18 18:24:59.775', '2026-08-18 18:24:40.564', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzsj7r001losqmkc8nxfx6', 'curl/8.6.0', '::1', '2026-08-25 18:24:43.333', '2026-08-19 06:30:00.235', '2026-08-18 18:24:43.335', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyzsq6z001nosqm413yhx13', 'curl/8.6.0', '::1', '2026-08-25 18:24:52.378', '2026-08-19 06:30:00.235', '2026-08-18 18:24:52.379', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyzsvwh001posqm89q1zjsz', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:24:59.776', NULL, '2026-08-18 18:24:59.777', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzsvwh001qosqml59qop96', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:24:59.777', '2026-08-18 18:27:18.254', '2026-08-18 18:24:59.777', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzu6c5001sosqm30w71nuu', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:25:59.956', '2026-08-19 06:30:00.235', '2026-08-18 18:25:59.957', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyzu6c5001tosqm2j5oalkj', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:25:59.956', '2026-08-18 18:27:09.911', '2026-08-18 18:25:59.957', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyzvobe001wosqme34f1cf2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:09.914', '2026-08-19 06:30:00.235', '2026-08-18 18:27:09.914', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyzvobf001xosqm3j9njai7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:09.915', '2026-08-18 18:28:59.308', '2026-08-18 18:27:09.915', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyzvur5001yosqmq48f9n28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:18.256', NULL, '2026-08-18 18:27:18.257', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvur6001zosqmloldnpeo', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:18.258', '2026-08-18 18:27:18.785', '2026-08-18 18:27:18.258', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvv5w0020osqmegpcvsux', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:18.787', NULL, '2026-08-18 18:27:18.788', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvv5w0021osqmhqw37sez', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:18.788', '2026-08-18 18:27:19.170', '2026-08-18 18:27:18.788', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvvgl0022osqmwnd2iqvn', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:19.172', NULL, '2026-08-18 18:27:19.173', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvvgm0023osqml5pvwziu', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:19.173', '2026-08-18 18:27:19.350', '2026-08-18 18:27:19.174', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvvll0024osqmtf4m0z4i', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:19.352', NULL, '2026-08-18 18:27:19.353', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvvlm0025osqmjus7ka1b', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:19.353', '2026-08-18 18:27:19.524', '2026-08-18 18:27:19.354', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvvqf0026osqmlzp63ldl', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:19.526', NULL, '2026-08-18 18:27:19.527', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvvqf0027osqm1r0m3wlx', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:19.527', '2026-08-18 18:27:19.675', '2026-08-18 18:27:19.527', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvvul0028osqm232myx9a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:19.677', NULL, '2026-08-18 18:27:19.677', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvvum0029osqm9373fqc8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:19.678', '2026-08-18 18:27:19.946', '2026-08-18 18:27:19.678', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvw25002aosqmxbluo0h8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:19.948', NULL, '2026-08-18 18:27:19.949', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvw25002bosqmb9nlvbvi', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:19.949', '2026-08-18 18:27:20.102', '2026-08-18 18:27:19.949', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvw6m002cosqmhwbvox91', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:20.109', NULL, '2026-08-18 18:27:20.110', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvw6s002dosqmi9woqeto', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:20.115', '2026-08-18 18:27:20.242', '2026-08-18 18:27:20.116', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvwad002eosqmz35jl1u0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:20.244', NULL, '2026-08-18 18:27:20.245', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvwae002fosqmhwxuhw1a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:20.245', '2026-08-18 18:27:20.375', '2026-08-18 18:27:20.246', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvwe2002gosqmite86lce', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:20.377', NULL, '2026-08-18 18:27:20.378', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvwe3002hosqmnq0xifw0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:20.378', '2026-08-18 18:27:20.510', '2026-08-18 18:27:20.379', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvwhv002iosqmnqp1a4b7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:20.514', '2026-08-18 18:27:20.658', '2026-08-18 18:27:20.515', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvwhv002josqmbm0it16b', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:20.514', NULL, '2026-08-18 18:27:20.515', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvwlx002kosqm6zfkdqm4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:20.660', NULL, '2026-08-18 18:27:20.661', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvwlx002losqm6snznrlt', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:20.661', '2026-08-18 18:27:20.778', '2026-08-18 18:27:20.661', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvwpb002mosqmhz0lxqut', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:20.783', NULL, '2026-08-18 18:27:20.783', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzvwpb002nosqmibnk4y00', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:27:20.782', NULL, '2026-08-18 18:27:20.783', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsyzy0q8002oosqmsy5epcsf', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:28:59.312', '2026-08-19 06:30:00.235', '2026-08-18 18:28:59.312', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyzy0qa002posqm20oh6t69', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:28:59.314', '2026-08-18 18:29:01.415', '2026-08-18 18:28:59.314', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyzy2cr002qosqmfgafgxhx', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:29:01.418', '2026-08-19 06:30:00.235', '2026-08-18 18:29:01.419', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyzy2cs002rosqm9nvs3zc6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:29:01.420', '2026-08-18 18:35:10.095', '2026-08-18 18:29:01.420', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsyzyd8k002sosqm580qjrbm', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:29:15.523', '2026-08-18 18:30:52.247', '2026-08-18 18:29:15.524', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsz00fve002tosqmlmhrrfqf', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:30:52.249', NULL, '2026-08-18 18:30:52.250', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsz00fve002uosqmuvvnahh7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:30:52.250', '2026-08-18 18:34:23.408', '2026-08-18 18:30:52.250', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsz028x5002vosqmdu73373f', 'curl/8.6.0', '::1', '2026-08-25 18:32:16.553', '2026-08-19 06:30:00.235', '2026-08-18 18:32:16.553', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsz03nfw0000ooqm8o59376w', 'curl/8.6.0', '::1', '2026-08-25 18:33:22.024', '2026-08-19 06:30:00.235', '2026-08-18 18:33:22.028', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsz04yt00006ooqm4rcnu1xq', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:34:23.411', NULL, '2026-08-18 18:34:23.412', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsz04yt20007ooqmkarcnye0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:34:23.413', '2026-08-18 18:34:44.720', '2026-08-18 18:34:23.414', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsz05f92000gooqm94soyxt3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:34:44.725', NULL, '2026-08-18 18:34:44.726', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsz05f92000hooqmwfhrbi5q', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:34:44.724', NULL, '2026-08-18 18:34:44.726', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsz05ytx000iooqmsiyqc3lr', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:35:10.100', '2026-08-19 06:30:00.235', '2026-08-18 18:35:10.101', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsz05ytx000jooqmn8ia98o3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-25 18:35:10.100', '2026-08-19 06:30:00.235', '2026-08-18 18:35:10.101', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsznhe6g0000dcqmlstrbdfs', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:27:54.369', '2026-08-19 05:35:32.613', '2026-08-19 05:27:54.376', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsznq3v80002dcqm3p3vvcls', 'curl/8.6.0', '::1', '2026-08-26 05:34:40.915', '2026-08-19 06:30:00.235', '2026-08-19 05:34:40.916', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmsznr7re0009dcqm94k2i8m4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:35:32.617', NULL, '2026-08-19 05:35:32.618', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsznr7rf000adcqmzlytejjm', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:35:32.618', '2026-08-19 05:35:45.930', '2026-08-19 05:35:32.619', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsznri1b000bdcqm1xu5cibg', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:35:45.934', NULL, '2026-08-19 05:35:45.935', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsznri1b000cdcqm3mi3axch', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:35:45.935', '2026-08-19 05:36:07.095', '2026-08-19 05:35:45.936', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsznryd6000ddcqmcfhhea37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:36:07.098', NULL, '2026-08-19 05:36:07.098', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmsznryd8000edcqmor28zdvd', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:36:07.099', '2026-08-19 05:37:15.622', '2026-08-19 05:36:07.100', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszntf8s000odcqmja523pqr', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:37:15.627', NULL, '2026-08-19 05:37:15.628', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszntf8u000pdcqmn5onxp47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:37:15.629', '2026-08-19 05:48:29.561', '2026-08-19 05:37:15.630', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszo7v9f0000ugqmfdxijvks', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:48:29.567', NULL, '2026-08-19 05:48:29.571', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszo7v9f0001ugqm9yf9bxma', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:48:29.571', '2026-08-19 05:48:34.562', '2026-08-19 05:48:29.571', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszo7z470002ugqmbfwad6n2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:48:34.566', NULL, '2026-08-19 05:48:34.567', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszo7z470003ugqmg4dvwo3d', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:48:34.566', '2026-08-19 05:51:31.499', '2026-08-19 05:48:34.567', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszo8f2k0004ugqm0swjnnum', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:48:55.244', '2026-08-19 05:49:14.873', '2026-08-19 05:48:55.244', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8u7w0005ugqmyo2h1x2j', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:14.875', '2026-08-19 06:30:00.235', '2026-08-19 05:49:14.876', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8u7x0006ugqmuo1vrf5b', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:14.877', '2026-08-19 05:49:15.351', '2026-08-19 05:49:14.877', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8ul60007ugqmx96j593p', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:15.354', '2026-08-19 06:30:00.235', '2026-08-19 05:49:15.354', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8ul70008ugqmc8tck136', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:15.355', '2026-08-19 05:49:15.554', '2026-08-19 05:49:15.355', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8uqu0009ugqmns6gky98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:15.557', '2026-08-19 06:30:00.235', '2026-08-19 05:49:15.558', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8uqu000augqmpcpbabs4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:15.558', '2026-08-19 05:49:15.773', '2026-08-19 05:49:15.558', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8uww000bugqmqgx4yy79', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:15.776', '2026-08-19 06:30:00.235', '2026-08-19 05:49:15.776', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8uwx000cugqmkekbh5po', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:15.777', '2026-08-19 05:49:15.933', '2026-08-19 05:49:15.777', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8v1c000dugqmz904ec89', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:15.935', '2026-08-19 06:30:00.235', '2026-08-19 05:49:15.936', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8v1d000eugqm7usjxxqh', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:15.936', '2026-08-19 05:49:16.063', '2026-08-19 05:49:15.937', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8v4y000fugqmll0aqqzj', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:16.066', '2026-08-19 06:30:00.235', '2026-08-19 05:49:16.066', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8v4z000gugqmll15ws82', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:16.066', '2026-08-19 05:49:17.620', '2026-08-19 05:49:16.067', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8wc6000hugqmh1z7pibj', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:17.622', '2026-08-19 06:30:00.235', '2026-08-19 05:49:17.622', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8wc7000iugqm5ajbz61m', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:17.622', '2026-08-19 05:49:18.140', '2026-08-19 05:49:17.623', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8wqo000jugqmjxccjjhj', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:18.143', '2026-08-19 06:30:00.235', '2026-08-19 05:49:18.144', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8wqo000kugqmqomdpy4x', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:18.143', '2026-08-19 05:49:18.439', '2026-08-19 05:49:18.144', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8wyy000lugqmpjj06lv9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:18.442', '2026-08-19 06:30:00.235', '2026-08-19 05:49:18.442', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo8wyz000mugqm50dwt7sk', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:49:18.442', '2026-08-19 05:51:18.337', '2026-08-19 05:49:18.443', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszo9mbt000nugqmpov57msj', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 05:49:51.304', '2026-08-19 05:50:45.467', '2026-08-19 05:49:51.305', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszobhhp0000f8qm5uo4asat', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:18.343', '2026-08-19 06:30:00.235', '2026-08-19 05:51:18.349', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszobhhp0001f8qm64xo5vc1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:18.348', '2026-08-19 05:51:20.312', '2026-08-19 05:51:18.349', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszobltr0002f8qmjpdq7ltn', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:23.965', '2026-08-19 05:51:25.870', '2026-08-19 05:51:23.967', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszobnap0003f8qm3wb5bzr4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:25.873', '2026-08-19 06:30:00.235', '2026-08-19 05:51:25.873', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszobnar0004f8qmu7xhbpsb', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:25.874', '2026-08-19 05:53:37.897', '2026-08-19 05:51:25.875', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszobrn50005f8qmsfy3s3q0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:31.504', NULL, '2026-08-19 05:51:31.505', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszobrn60006f8qmdumb7btq', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:31.505', '2026-08-19 05:51:32.877', '2026-08-19 05:51:31.506', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszobspe0007f8qm5kjrrmna', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:32.881', NULL, '2026-08-19 05:51:32.882', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszobspe0008f8qmzwwb0y9h', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:32.882', '2026-08-19 05:51:33.418', '2026-08-19 05:51:32.882', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszobt4e0009f8qmzlpof85f', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:33.421', NULL, '2026-08-19 05:51:33.422', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszobt4e000af8qm3vqkx53e', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:33.422', '2026-08-19 05:51:33.581', '2026-08-19 05:51:33.422', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszobt8y000bf8qm0oe77w8k', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:33.585', NULL, '2026-08-19 05:51:33.586', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszobt8y000cf8qm27zfv5dp', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:33.585', '2026-08-19 05:51:33.752', '2026-08-19 05:51:33.586', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszobtdp000df8qm6385pfj6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:33.756', NULL, '2026-08-19 05:51:33.757', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszobtdp000ef8qm9i3ev21r', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:33.756', '2026-08-19 05:51:33.918', '2026-08-19 05:51:33.757', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszobtia000ff8qmva5w11k9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:33.921', '2026-08-19 05:51:36.066', '2026-08-19 05:51:33.922', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszobtic000gf8qmwhzvhldk', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:51:33.923', NULL, '2026-08-19 05:51:33.924', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszoeh63000hf8qm1etecnib', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:37.898', '2026-08-19 06:30:00.235', '2026-08-19 05:53:37.899', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoeh63000if8qm9rdiw0rq', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:37.898', '2026-08-19 05:53:38.346', '2026-08-19 05:53:37.899', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoehim000jf8qmxjxouch9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:38.349', '2026-08-19 06:30:00.235', '2026-08-19 05:53:38.350', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoehim000kf8qmtnca9gy7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:38.349', '2026-08-19 05:53:38.532', '2026-08-19 05:53:38.350', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoehnq000lf8qm21lu2ugs', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:38.534', '2026-08-19 06:30:00.235', '2026-08-19 05:53:38.534', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoehnr000mf8qmu32966uo', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:38.535', '2026-08-19 05:53:38.732', '2026-08-19 05:53:38.535', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoehtd000nf8qm8x0v3721', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:38.737', '2026-08-19 05:53:38.882', '2026-08-19 05:53:38.737', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoehte000of8qmk4s7rjyn', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:38.736', '2026-08-19 06:30:00.235', '2026-08-19 05:53:38.738', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoehxh000pf8qm5xdpbv92', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:38.885', '2026-08-19 06:30:00.235', '2026-08-19 05:53:38.885', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoehxj000qf8qmazp4wgj5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:38.886', '2026-08-19 05:53:39.069', '2026-08-19 05:53:38.887', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoei2t000rf8qmc9hz7fnl', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:39.077', '2026-08-19 05:53:39.208', '2026-08-19 05:53:39.077', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoei2u000sf8qm47z9uq1q', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:39.078', '2026-08-19 06:30:00.235', '2026-08-19 05:53:39.078', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoei6m000tf8qmt7rzgf3t', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:39.212', '2026-08-19 06:30:00.235', '2026-08-19 05:53:39.214', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoei6m000uf8qmihuxigot', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:39.213', '2026-08-19 05:53:39.415', '2026-08-19 05:53:39.214', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoeicb000vf8qmj1fdhibm', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:39.418', '2026-08-19 06:30:00.235', '2026-08-19 05:53:39.419', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoeicb000wf8qmopw4h4bo', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:39.418', '2026-08-19 05:53:39.554', '2026-08-19 05:53:39.419', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoeig7000xf8qmknzrwre2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:39.558', '2026-08-19 06:30:00.235', '2026-08-19 05:53:39.559', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoeig8000yf8qmuhyo299z', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:39.560', '2026-08-19 05:53:39.726', '2026-08-19 05:53:39.560', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoeikz000zf8qmy7f9gpxl', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:39.730', '2026-08-19 05:53:39.891', '2026-08-19 05:53:39.731', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoeikz0010f8qmvibrer0g', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:39.730', '2026-08-19 06:30:00.235', '2026-08-19 05:53:39.731', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoeiph0011f8qmqtu5f4qs', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:39.892', '2026-08-19 06:30:00.235', '2026-08-19 05:53:39.893', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoeiph0012f8qm2i877mv6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:39.893', '2026-08-19 05:53:40.056', '2026-08-19 05:53:39.893', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoeiu60013f8qmq63b9r7i', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:40.062', '2026-08-19 06:30:00.235', '2026-08-19 05:53:40.062', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoeiua0014f8qmx9q7llot', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:40.066', '2026-08-19 05:53:40.209', '2026-08-19 05:53:40.066', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoeiyc0015f8qmd12uhbpp', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:40.211', '2026-08-19 06:30:00.235', '2026-08-19 05:53:40.212', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoeiyd0016f8qmzq7yuk18', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:40.212', '2026-08-19 05:53:40.374', '2026-08-19 05:53:40.213', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoej2y0017f8qmdw8dgvfc', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:40.377', '2026-08-19 06:30:00.235', '2026-08-19 05:53:40.378', 'cmsyoqerv0000o0qmpe1j1ox3');
INSERT INTO `refreshtoken` (`id`, `userAgent`, `ipAddress`, `expiresAt`, `revokedAt`, `createdAt`, `userId`) VALUES
('cmszoej2y0018f8qmab8bim1q', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:40.378', '2026-08-19 05:53:40.527', '2026-08-19 05:53:40.378', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoej760019f8qm889m25j5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:40.529', '2026-08-19 06:30:00.235', '2026-08-19 05:53:40.530', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoej76001af8qmghjbjr7p', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:40.529', '2026-08-19 06:30:00.235', '2026-08-19 05:53:40.530', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoenr0001bf8qmqkylzela', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:46.427', '2026-08-19 06:30:00.235', '2026-08-19 05:53:46.428', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoexee001cf8qmaot6fkhi', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 05:53:58.933', '2026-08-19 06:01:31.323', '2026-08-19 05:53:58.934', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszofp62001df8qmvd8rp3wa', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 05:54:34.922', '2026-08-19 05:54:49.098', '2026-08-19 05:54:34.922', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszog1ca001ef8qmiqcmfn5s', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 05:54:50.696', '2026-08-19 05:56:11.917', '2026-08-19 05:54:50.698', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszohs0f001ff8qmydgyhszj', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 05:56:11.919', '2026-08-19 06:30:00.235', '2026-08-19 05:56:11.919', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszohs0f001gf8qmqobsqfdj', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 05:56:11.919', '2026-08-19 05:56:17.669', '2026-08-19 05:56:11.919', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszohwg9001hf8qmq72c2l4h', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 05:56:17.672', '2026-08-19 06:30:00.235', '2026-08-19 05:56:17.673', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszohwg9001if8qmafj41zus', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 05:56:17.673', '2026-08-19 06:01:00.487', '2026-08-19 05:56:17.673', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszonyoi0000xoqmmwc50pnh', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:01:00.493', '2026-08-19 06:30:00.235', '2026-08-19 06:01:00.498', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszonyoj0001xoqmdplfdmkm', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:01:00.498', '2026-08-19 06:02:31.405', '2026-08-19 06:01:00.499', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoomh3000014qmrshojf4w', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:01:31.329', NULL, '2026-08-19 06:01:31.335', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszoomh4000114qmp4twym5u', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:01:31.334', '2026-08-19 06:02:44.718', '2026-08-19 06:01:31.336', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszooomc000214qmpvp4mdj7', 'curl/8.6.0', '::1', '2026-08-26 06:01:34.115', '2026-08-19 06:30:00.235', '2026-08-19 06:01:34.116', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszopwtt000714qm7tbzrqxz', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:02:31.408', '2026-08-19 06:30:00.235', '2026-08-19 06:02:31.409', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszopwtt000814qmq9ahjy4g', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:02:31.409', '2026-08-19 06:03:28.257', '2026-08-19 06:02:31.409', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszoq73n000914qm6uh7dti7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:02:44.722', NULL, '2026-08-19 06:02:44.723', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszoq73n000a14qmk3qx61le', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:02:44.723', '2026-08-19 06:07:23.206', '2026-08-19 06:02:44.723', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszor4p2000b14qmmhp2s4x8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:03:28.261', '2026-08-19 06:30:00.235', '2026-08-19 06:03:28.262', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszor4p2000c14qm6kdk5peq', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:03:28.261', '2026-08-19 06:07:45.100', '2026-08-19 06:03:28.262', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszow5zf000e14qml9jhgfz4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:07:23.210', NULL, '2026-08-19 06:07:23.211', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszow5zf000f14qmasd7x3lg', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:07:23.211', '2026-08-19 06:18:41.830', '2026-08-19 06:07:23.211', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszowo3y000g14qm7eh5c3xc', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:07:46.701', '2026-08-19 06:12:39.715', '2026-08-19 06:07:46.702', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszp0s3g000h14qm9xtspfyv', 'curl/8.6.0', '::1', '2026-08-26 06:10:58.491', '2026-08-19 06:30:00.235', '2026-08-19 06:10:58.492', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszp2y7a000m14qmrnbq8bt7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:12:39.717', '2026-08-19 06:30:00.235', '2026-08-19 06:12:39.718', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszp2y7b000n14qmn58lho3n', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:12:39.718', '2026-08-19 06:18:22.494', '2026-08-19 06:12:39.719', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszp9e2j0000okqmuq5817fk', 'curl/8.6.0', '::1', '2026-08-26 06:17:40.213', '2026-08-19 06:30:00.235', '2026-08-19 06:17:40.219', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszp9ngg0002okqmw7g7ztq1', 'curl/8.6.0', '::1', '2026-08-26 06:17:52.383', '2026-08-19 06:30:00.235', '2026-08-19 06:17:52.384', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszpaaoy0006okqm2iimafee', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:18:22.497', '2026-08-19 06:30:00.235', '2026-08-19 06:18:22.498', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszpaaoy0007okqm4dv80y18', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:18:22.498', '2026-08-19 06:22:49.876', '2026-08-19 06:18:22.499', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszpapm20008okqmu2uw3112', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:18:41.834', NULL, '2026-08-19 06:18:41.834', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpapm40009okqmnw51vt4g', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:18:41.835', '2026-08-19 06:22:40.575', '2026-08-19 06:18:41.836', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpfttv000aokqmreruu6ar', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:22:40.579', NULL, '2026-08-19 06:22:40.579', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpfttw000bokqmawy3k2d3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:22:40.579', '2026-08-19 06:23:06.517', '2026-08-19 06:22:40.580', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpg108000cokqm6lax5nfn', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:22:49.879', '2026-08-19 06:30:00.235', '2026-08-19 06:22:49.880', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszpg108000dokqmz1ypq3p5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:22:49.879', '2026-08-19 06:30:00.017', '2026-08-19 06:22:49.880', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszpgdui000fokqm7qeatge9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:23:06.521', NULL, '2026-08-19 06:23:06.522', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpgduj000gokqmv8dsuw0z', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:23:06.522', '2026-08-19 06:23:17.886', '2026-08-19 06:23:06.523', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpgmma000iokqm8yy9mbga', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:23:17.890', NULL, '2026-08-19 06:23:17.890', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpgmmb000jokqme5p3uvf9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:23:17.890', '2026-08-19 06:29:58.254', '2026-08-19 06:23:17.891', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpp7jl000lokqmcdajhoev', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:29:58.257', '2026-08-19 06:36:52.421', '2026-08-19 06:29:58.257', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpp7jl000mokqmnb4hk4dq', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:29:58.257', NULL, '2026-08-19 06:29:58.257', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpp8wj000nokqmbh0xi78k', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:30:00.019', '2026-08-19 06:30:00.235', '2026-08-19 06:30:00.019', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszptltj0000coqmrxplukai', 'curl/8.6.0', '::1', '2026-08-26 06:33:23.377', '2026-08-19 06:37:09.155', '2026-08-19 06:33:23.383', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszptull0003coqm4oqyo5j2', 'curl/8.6.0', '::1', '2026-08-26 06:33:34.761', '2026-08-19 06:37:09.155', '2026-08-19 06:33:34.761', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszpy34b0006coqmt65f4gwu', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:36:52.426', NULL, '2026-08-19 06:36:52.427', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpy34b0007coqmtlito216', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:36:52.427', '2026-08-19 06:37:34.979', '2026-08-19 06:36:52.427', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpyg110008coqmw8d21d9b', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:37:09.153', '2026-08-19 06:37:09.155', '2026-08-19 06:37:09.157', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszpyh0y0009coqm5kgzshji', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:37:10.449', '2026-08-19 06:37:38.460', '2026-08-19 06:37:10.450', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszpyzyf000ccoqmeab3vf2f', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:37:34.983', NULL, '2026-08-19 06:37:34.983', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpyzyh000dcoqmad6bjn3n', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:37:34.984', '2026-08-19 06:37:53.996', '2026-08-19 06:37:34.985', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpz2n6000ecoqm8h21y5pe', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:37:38.466', NULL, '2026-08-19 06:37:38.466', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszpz2nb000fcoqmevqb1x9b', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', '::1', '2026-08-26 06:37:38.470', NULL, '2026-08-19 06:37:38.471', 'cmsyoqerv0000o0qmpe1j1ox3'),
('cmszpzemo000gcoqm7sd7uv38', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:37:53.999', NULL, '2026-08-19 06:37:54.000', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpzemq000hcoqm7wg6prq4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:37:54.001', '2026-08-19 06:38:11.502', '2026-08-19 06:37:54.002', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpzs50000kcoqm7t0np29j', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:11.507', NULL, '2026-08-19 06:38:11.508', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpzs50000lcoqm77joi2am', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:11.507', '2026-08-19 06:38:12.247', '2026-08-19 06:38:11.508', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpzspn000mcoqmngfhny6e', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:12.250', NULL, '2026-08-19 06:38:12.251', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpzspp000ncoqm9kacy1au', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:12.252', '2026-08-19 06:38:12.782', '2026-08-19 06:38:12.253', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpzt4j000ocoqmfiqpg1pl', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:12.786', NULL, '2026-08-19 06:38:12.787', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpzt4k000pcoqm4n0966sq', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:12.788', '2026-08-19 06:38:13.268', '2026-08-19 06:38:12.788', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpzti1000qcoqmhkeoh78i', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:13.272', NULL, '2026-08-19 06:38:13.273', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpzti2000rcoqmlcbozxrz', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:13.273', '2026-08-19 06:38:13.457', '2026-08-19 06:38:13.274', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpztn9000scoqmrnf8lnpi', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:13.461', NULL, '2026-08-19 06:38:13.461', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpztnb000tcoqm7ihbf5iv', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:13.462', '2026-08-19 06:38:13.639', '2026-08-19 06:38:13.463', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpztsd000ucoqmdeo8u4yi', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:13.644', NULL, '2026-08-19 06:38:13.645', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpztsd000vcoqmepcwb97k', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:13.644', '2026-08-19 06:38:13.768', '2026-08-19 06:38:13.645', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpztvw000wcoqm7w6srggw', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:13.771', NULL, '2026-08-19 06:38:13.772', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszpztvw000xcoqm9uvgo008', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:13.772', '2026-08-19 06:38:34.948', '2026-08-19 06:38:13.772', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszq0a88000ycoqm036nfgzd', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:34.951', NULL, '2026-08-19 06:38:34.952', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszq0a89000zcoqmakv5llec', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:34.953', '2026-08-19 06:38:43.050', '2026-08-19 06:38:34.953', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszq0ghb0010coqmvff8sjah', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:43.054', NULL, '2026-08-19 06:38:43.055', 'cmsyx4vjg0004dcqmxk4wp1mx'),
('cmszq0ghb0011coqmb06nmbnb', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '::1', '2026-08-26 06:38:43.055', NULL, '2026-08-19 06:38:43.055', 'cmsyx4vjg0004dcqmxk4wp1mx');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `isSystem` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `name`, `description`, `isSystem`, `createdAt`, `updatedAt`) VALUES
('cmsuew6i30002p4qmn8h155or', 'Admin', 'Full access to every module', 1, '2026-08-15 13:28:36.843', '2026-08-15 13:28:36.843'),
('cmsuew6i90003p4qmxbr2m8ce', 'Agent', 'Day-to-day CRM user without admin access', 1, '2026-08-15 13:28:36.849', '2026-08-15 13:28:36.849'),
('cmsydz0710001ocqmcp9anyn4', 'Super Admin', 'Platform operator — manages customers, plans, and platform settings', 1, '2026-08-18 08:13:53.725', '2026-08-18 08:13:53.725');

-- --------------------------------------------------------

--
-- Table structure for table `systemsetting`
--

CREATE TABLE `systemsetting` (
  `key` varchar(191) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`value`)),
  `updatedAt` datetime(3) NOT NULL,
  `updatedByUserId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `systemsetting`
--

INSERT INTO `systemsetting` (`key`, `value`, `updatedAt`, `updatedByUserId`) VALUES
('app.name', '\"WhatsApp CRM Live Verify\"', '2026-08-15 17:54:31.263', NULL),
('branding.appName', '\"WhatsApp\"', '2026-08-19 06:38:10.502', 'cmsyoqerv0000o0qmpe1j1ox3'),
('branding.supportContact', '\"918441098140\"', '2026-08-19 06:38:10.502', 'cmsyoqerv0000o0qmpe1j1ox3');

-- --------------------------------------------------------

--
-- Table structure for table `template`
--

CREATE TABLE `template` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `category` varchar(191) DEFAULT NULL,
  `body` text NOT NULL,
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables`)),
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `organizationId` varchar(191) NOT NULL,
  `mediaId` varchar(191) DEFAULT NULL,
  `createdByUserId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `template`
--

INSERT INTO `template` (`id`, `name`, `category`, `body`, `variables`, `isActive`, `createdAt`, `updatedAt`, `organizationId`, `mediaId`, `createdByUserId`) VALUES
('cmsyziaq2000nosqm5ci4zcje', 'Welcome Greeting', 'Onboarding', 'Hey {{firstName}} 🙌\n\nTo get started, could you tell us a little about what brings you here today?\n\nReply for further assistance or speak to our expert 🤝🎁', '[\"firstName\"]', 1, '2026-08-18 18:16:45.770', '2026-08-18 18:16:45.770', 'cmsyx4vjb0003dcqmx0x9ptmg', NULL, 'cmsyx4vjg0004dcqmxk4wp1mx');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `passwordHash` varchar(191) NOT NULL,
  `firstName` varchar(191) NOT NULL,
  `lastName` varchar(191) NOT NULL,
  `avatarUrl` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `roleId` varchar(191) NOT NULL,
  `organizationId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `passwordHash`, `firstName`, `lastName`, `avatarUrl`, `isActive`, `createdAt`, `updatedAt`, `roleId`, `organizationId`) VALUES
('cmsyoqerv0000o0qmpe1j1ox3', 'kumawat256@gmail.com', '$2b$12$qMgVcNZdwaTi5ucZr6MPquMRTyEGyCFHXUOaGQH1qD9cfGP8GOf9O', 'Super', 'Admin', NULL, 1, '2026-08-18 13:15:08.491', '2026-08-18 13:15:08.491', 'cmsydz0710001ocqmcp9anyn4', NULL),
('cmsyx4vjg0004dcqmxk4wp1mx', 'rakeshkumar576@gmail.com', '$2b$12$CuLWjcdJJQsXZNVRdQ9OK.7K29usWrIY3arBMuSuj4rmG7rnTWv4a', 'Rakesh ', 'Kumar', NULL, 1, '2026-08-18 17:10:20.332', '2026-08-18 17:10:20.332', 'cmsuew6i30002p4qmn8h155or', 'cmsyx4vjb0003dcqmx0x9ptmg');

-- --------------------------------------------------------

--
-- Table structure for table `whatsappaccount`
--

CREATE TABLE `whatsappaccount` (
  `id` varchar(191) NOT NULL,
  `label` varchar(191) NOT NULL,
  `phoneNumber` varchar(191) DEFAULT NULL,
  `status` enum('DISCONNECTED','CONNECTING','CONNECTED','LOGGED_OUT') NOT NULL DEFAULT 'DISCONNECTED',
  `connectedAt` datetime(3) DEFAULT NULL,
  `lastSeenAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `organizationId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `whatsappaccount`
--

INSERT INTO `whatsappaccount` (`id`, `label`, `phoneNumber`, `status`, `connectedAt`, `lastSeenAt`, `createdAt`, `updatedAt`, `organizationId`) VALUES
('cmsyzjt6f000sosqmvxiomj5m', 'Krishan Kumar', '918441098140', 'DISCONNECTED', '2026-08-19 05:46:51.252', '2026-08-19 05:50:54.127', '2026-08-18 18:17:56.343', '2026-08-19 05:50:54.135', 'cmsyx4vjb0003dcqmx0x9ptmg');

-- --------------------------------------------------------

--
-- Table structure for table `whatsappsession`
--

CREATE TABLE `whatsappsession` (
  `id` varchar(191) NOT NULL,
  `status` enum('ACTIVE','REVOKED','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  `sessionData` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `revokedAt` datetime(3) DEFAULT NULL,
  `accountId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `whatsappsession`
--

INSERT INTO `whatsappsession` (`id`, `status`, `sessionData`, `createdAt`, `updatedAt`, `revokedAt`, `accountId`) VALUES
('cmsyzjt6v000tosqmcqpuvcz4', 'ACTIVE', NULL, '2026-08-18 18:17:56.359', '2026-08-18 18:17:56.359', NULL, 'cmsyzjt6f000sosqmvxiomj5m');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('0069fc79-7511-4ca7-afdd-85e1d8033868', 'c403fd669d23310502b8e1237ba080566386c43107ad962e7b747310f2f89d86', '2026-08-16 09:46:22.030', '20260816094610_remove_tags', NULL, NULL, '2026-08-16 09:46:22.021', 1),
('444205f0-7d0d-46f3-9299-3fa8f263facd', 'a1ced8893500302b3ece1668dc6c8ab4bce546df701d3bdb6def0e37ca8b7f03', '2026-08-18 08:26:33.507', '20260818082607_tighten_multi_tenant_columns', NULL, NULL, '2026-08-18 08:26:32.858', 1),
('580f18e0-c5fd-4e9f-a212-6d20d0f240f0', '2d7d6f1bae56aa872afe52f811f89e7d84997fff3f8089c9365480e012bf9879', '2026-08-15 13:43:01.586', '20260815134300_full_data_model', NULL, NULL, '2026-08-15 13:43:00.574', 1),
('6a14ad0d-3b79-4ccd-bb25-0de8d22d12b3', '73d73c2257786dcf27b8085f3d9b8294d5c5365116403a31c339b9554295a0a4', '2026-08-18 17:45:17.464', '20260818231516_add_campaign_batch_settings', NULL, NULL, '2026-08-18 17:45:17.457', 1),
('8977a5e1-4eba-4121-a891-f9ce1d78f756', '87e97330e1a636579e0de1d73cdd39848935be017df10bf181f4472b5ef78384', '2026-08-15 13:19:17.941', '20260815131917_init_auth_rbac', NULL, NULL, '2026-08-15 13:19:17.812', 1),
('a1489666-37b8-4e60-bcc0-fd51086e93ad', 'deeb76d01609ca65dcf3d89b1741c738bbaf366709f245a96125a05069b64d4a', '2026-08-15 13:23:47.105', '20260815132347_refresh_token_simplify', NULL, NULL, '2026-08-15 13:23:47.058', 1),
('a8130358-7aef-4122-b323-54a253de8878', '92c1180ab6e4e8e3d496b31adcd2c31c54ae67f70b45d050e014f482c5c97f91', '2026-08-16 11:54:06.902', '20260816115344_remove_contact_email', NULL, NULL, '2026-08-16 11:54:06.889', 1),
('b5e3eee6-0ece-4bf0-a81a-42b328234942', 'd19ba209db0ecf86d39afbb6836a87b11acb8e692e1c68d51119b1da9965d1ab', '2026-08-18 07:51:21.429', '20260818075053_add_multi_tenant_columns', NULL, NULL, '2026-08-18 07:51:20.898', 1),
('dd2755b9-b688-45ed-b81b-da60f5cf36a8', 'ca993a8cd79cb875f29902597f8c868d944944fcdbfb4e0354fe67ac45bf5b87', '2026-08-19 05:06:28.253', '20260819103613_plan_expiry_and_message_indexes', NULL, NULL, '2026-08-19 05:06:28.240', 1);

-- --------------------------------------------------------

--
-- Table structure for table `_rolepermissions`
--

CREATE TABLE `_rolepermissions` (
  `A` varchar(191) NOT NULL,
  `B` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_rolepermissions`
--

INSERT INTO `_rolepermissions` (`A`, `B`) VALUES
('cb190e7b771c248e18b1dfc9c', 'cmsuew6i30002p4qmn8h155or'),
('cb190e7b771c248e18b1dfc9c', 'cmsydz0710001ocqmcp9anyn4'),
('cmsuew6hi0000p4qm1xqlr6v1', 'cmsuew6i30002p4qmn8h155or'),
('cmsuew6hi0000p4qm1xqlr6v1', 'cmsydz0710001ocqmcp9anyn4'),
('cmsuew6hm0001p4qmn4ietp3o', 'cmsuew6i30002p4qmn8h155or'),
('cmsuew6hm0001p4qmn4ietp3o', 'cmsydz0710001ocqmcp9anyn4'),
('cmsufxb7m0000s8qmg1as3j8v', 'cmsuew6i30002p4qmn8h155or'),
('cmsufxb7m0000s8qmg1as3j8v', 'cmsydz0710001ocqmcp9anyn4'),
('cmsugwvu70000fsqmg9thwzfs', 'cmsuew6i30002p4qmn8h155or'),
('cmsugwvu70000fsqmg9thwzfs', 'cmsuew6i90003p4qmxbr2m8ce'),
('cmsugwvu70000fsqmg9thwzfs', 'cmsydz0710001ocqmcp9anyn4'),
('cmsugwvub0001fsqme9zrw2af', 'cmsuew6i30002p4qmn8h155or'),
('cmsugwvub0001fsqme9zrw2af', 'cmsuew6i90003p4qmxbr2m8ce'),
('cmsugwvub0001fsqme9zrw2af', 'cmsydz0710001ocqmcp9anyn4'),
('cmsuhorq10000ocqm4d1dpdsm', 'cmsuew6i30002p4qmn8h155or'),
('cmsuhorq10000ocqm4d1dpdsm', 'cmsuew6i90003p4qmxbr2m8ce'),
('cmsuhorq10000ocqm4d1dpdsm', 'cmsydz0710001ocqmcp9anyn4'),
('cmsui9tfy0000doqmmx9phxgz', 'cmsuew6i30002p4qmn8h155or'),
('cmsui9tfy0000doqmmx9phxgz', 'cmsuew6i90003p4qmxbr2m8ce'),
('cmsui9tfy0000doqmmx9phxgz', 'cmsydz0710001ocqmcp9anyn4'),
('cmsui9tg20001doqmbrwtbakt', 'cmsuew6i30002p4qmn8h155or'),
('cmsui9tg20001doqmbrwtbakt', 'cmsuew6i90003p4qmxbr2m8ce'),
('cmsui9tg20001doqmbrwtbakt', 'cmsydz0710001ocqmcp9anyn4'),
('cmsumvttz0000soqm0dsrnvi4', 'cmsuew6i30002p4qmn8h155or'),
('cmsumvttz0000soqm0dsrnvi4', 'cmsydz0710001ocqmcp9anyn4'),
('cmsuo18hg0000mwqmr9izu6ty', 'cmsydz0710001ocqmcp9anyn4'),
('cmsuo18hj0001mwqmt254sjmj', 'cmsuew6i30002p4qmn8h155or'),
('cmsuo18hj0001mwqmt254sjmj', 'cmsydz0710001ocqmcp9anyn4'),
('cmsuooxxj0000bgqmt8ygsqd8', 'cmsuew6i30002p4qmn8h155or'),
('cmsuooxxj0000bgqmt8ygsqd8', 'cmsydz0710001ocqmcp9anyn4'),
('cmsuooxxl0001bgqmb5bbivbj', 'cmsuew6i30002p4qmn8h155or'),
('cmsuooxxl0001bgqmb5bbivbj', 'cmsydz0710001ocqmcp9anyn4'),
('cmsydz06a0000ocqmuzkz4vsg', 'cmsydz0710001ocqmcp9anyn4');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auditlog`
--
ALTER TABLE `auditlog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `AuditLog_userId_idx` (`userId`),
  ADD KEY `AuditLog_entityType_entityId_idx` (`entityType`,`entityId`),
  ADD KEY `AuditLog_createdAt_idx` (`createdAt`),
  ADD KEY `AuditLog_organizationId_createdAt_idx` (`organizationId`,`createdAt`);

--
-- Indexes for table `automation`
--
ALTER TABLE `automation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Automation_organizationId_idx` (`organizationId`),
  ADD KEY `Automation_createdByUserId_fkey` (`createdByUserId`);

--
-- Indexes for table `campaign`
--
ALTER TABLE `campaign`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Campaign_organizationId_idx` (`organizationId`),
  ADD KEY `Campaign_status_idx` (`status`),
  ADD KEY `Campaign_templateId_fkey` (`templateId`),
  ADD KEY `Campaign_whatsAppAccountId_fkey` (`whatsAppAccountId`),
  ADD KEY `Campaign_createdByUserId_fkey` (`createdByUserId`);

--
-- Indexes for table `campaignrecipient`
--
ALTER TABLE `campaignrecipient`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `CampaignRecipient_campaignId_contactId_key` (`campaignId`,`contactId`),
  ADD UNIQUE KEY `CampaignRecipient_messageId_key` (`messageId`),
  ADD KEY `CampaignRecipient_campaignId_status_idx` (`campaignId`,`status`),
  ADD KEY `CampaignRecipient_contactId_fkey` (`contactId`),
  ADD KEY `CampaignRecipient_organizationId_idx` (`organizationId`);

--
-- Indexes for table `contact`
--
ALTER TABLE `contact`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Contact_organizationId_phoneNumber_key` (`organizationId`,`phoneNumber`),
  ADD KEY `Contact_organizationId_idx` (`organizationId`),
  ADD KEY `Contact_isOptedOut_idx` (`isOptedOut`);

--
-- Indexes for table `conversation`
--
ALTER TABLE `conversation`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Conversation_whatsAppAccountId_contactId_key` (`whatsAppAccountId`,`contactId`),
  ADD KEY `Conversation_contactId_idx` (`contactId`),
  ADD KEY `Conversation_assignedToUserId_idx` (`assignedToUserId`),
  ADD KEY `Conversation_lastMessageAt_idx` (`lastMessageAt`),
  ADD KEY `Conversation_organizationId_idx` (`organizationId`);

--
-- Indexes for table `credittransaction`
--
ALTER TABLE `credittransaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `CreditTransaction_walletId_createdAt_idx` (`walletId`,`createdAt`),
  ADD KEY `CreditTransaction_createdByUserId_fkey` (`createdByUserId`),
  ADD KEY `CreditTransaction_organizationId_createdAt_idx` (`organizationId`,`createdAt`);

--
-- Indexes for table `creditwallet`
--
ALTER TABLE `creditwallet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `CreditWallet_organizationId_key` (`organizationId`);

--
-- Indexes for table `list`
--
ALTER TABLE `list`
  ADD PRIMARY KEY (`id`),
  ADD KEY `List_organizationId_idx` (`organizationId`);

--
-- Indexes for table `listmember`
--
ALTER TABLE `listmember`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ListMember_listId_contactId_key` (`listId`,`contactId`),
  ADD KEY `ListMember_contactId_idx` (`contactId`),
  ADD KEY `ListMember_organizationId_idx` (`organizationId`);

--
-- Indexes for table `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Media_uploadedByUserId_idx` (`uploadedByUserId`),
  ADD KEY `Media_organizationId_idx` (`organizationId`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Message_conversationId_createdAt_idx` (`conversationId`,`createdAt`),
  ADD KEY `Message_whatsAppAccountId_idx` (`whatsAppAccountId`),
  ADD KEY `Message_waMessageId_idx` (`waMessageId`),
  ADD KEY `Message_mediaId_fkey` (`mediaId`),
  ADD KEY `Message_sentByUserId_fkey` (`sentByUserId`),
  ADD KEY `Message_organizationId_idx` (`organizationId`),
  ADD KEY `Message_organizationId_status_idx` (`organizationId`,`status`),
  ADD KEY `Message_organizationId_createdAt_idx` (`organizationId`,`createdAt`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Notification_userId_isRead_idx` (`userId`,`isRead`);

--
-- Indexes for table `organization`
--
ALTER TABLE `organization`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Organization_status_idx` (`status`),
  ADD KEY `Organization_planId_fkey` (`planId`);

--
-- Indexes for table `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Permission_key_key` (`key`);

--
-- Indexes for table `plan`
--
ALTER TABLE `plan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Plan_name_key` (`name`);

--
-- Indexes for table `refreshtoken`
--
ALTER TABLE `refreshtoken`
  ADD PRIMARY KEY (`id`),
  ADD KEY `RefreshToken_userId_idx` (`userId`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Role_name_key` (`name`);

--
-- Indexes for table `systemsetting`
--
ALTER TABLE `systemsetting`
  ADD PRIMARY KEY (`key`),
  ADD KEY `SystemSetting_updatedByUserId_fkey` (`updatedByUserId`);

--
-- Indexes for table `template`
--
ALTER TABLE `template`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Template_organizationId_idx` (`organizationId`),
  ADD KEY `Template_mediaId_fkey` (`mediaId`),
  ADD KEY `Template_createdByUserId_fkey` (`createdByUserId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD KEY `User_roleId_idx` (`roleId`),
  ADD KEY `User_organizationId_idx` (`organizationId`);

--
-- Indexes for table `whatsappaccount`
--
ALTER TABLE `whatsappaccount`
  ADD PRIMARY KEY (`id`),
  ADD KEY `WhatsAppAccount_organizationId_idx` (`organizationId`);

--
-- Indexes for table `whatsappsession`
--
ALTER TABLE `whatsappsession`
  ADD PRIMARY KEY (`id`),
  ADD KEY `WhatsAppSession_accountId_idx` (`accountId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `_rolepermissions`
--
ALTER TABLE `_rolepermissions`
  ADD UNIQUE KEY `_RolePermissions_AB_unique` (`A`,`B`),
  ADD KEY `_RolePermissions_B_index` (`B`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auditlog`
--
ALTER TABLE `auditlog`
  ADD CONSTRAINT `AuditLog_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `automation`
--
ALTER TABLE `automation`
  ADD CONSTRAINT `Automation_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Automation_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `campaign`
--
ALTER TABLE `campaign`
  ADD CONSTRAINT `Campaign_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Campaign_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Campaign_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `template` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Campaign_whatsAppAccountId_fkey` FOREIGN KEY (`whatsAppAccountId`) REFERENCES `whatsappaccount` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `campaignrecipient`
--
ALTER TABLE `campaignrecipient`
  ADD CONSTRAINT `CampaignRecipient_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaign` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CampaignRecipient_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `contact` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `CampaignRecipient_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `message` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `CampaignRecipient_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `contact`
--
ALTER TABLE `contact`
  ADD CONSTRAINT `Contact_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `conversation`
--
ALTER TABLE `conversation`
  ADD CONSTRAINT `Conversation_assignedToUserId_fkey` FOREIGN KEY (`assignedToUserId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Conversation_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `contact` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Conversation_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Conversation_whatsAppAccountId_fkey` FOREIGN KEY (`whatsAppAccountId`) REFERENCES `whatsappaccount` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `credittransaction`
--
ALTER TABLE `credittransaction`
  ADD CONSTRAINT `CreditTransaction_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `CreditTransaction_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `CreditTransaction_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `creditwallet` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `creditwallet`
--
ALTER TABLE `creditwallet`
  ADD CONSTRAINT `CreditWallet_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `list`
--
ALTER TABLE `list`
  ADD CONSTRAINT `List_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `listmember`
--
ALTER TABLE `listmember`
  ADD CONSTRAINT `ListMember_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `contact` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ListMember_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `list` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ListMember_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `media`
--
ALTER TABLE `media`
  ADD CONSTRAINT `Media_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Media_uploadedByUserId_fkey` FOREIGN KEY (`uploadedByUserId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Message_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Message_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Message_sentByUserId_fkey` FOREIGN KEY (`sentByUserId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Message_whatsAppAccountId_fkey` FOREIGN KEY (`whatsAppAccountId`) REFERENCES `whatsappaccount` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `organization`
--
ALTER TABLE `organization`
  ADD CONSTRAINT `Organization_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `refreshtoken`
--
ALTER TABLE `refreshtoken`
  ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `systemsetting`
--
ALTER TABLE `systemsetting`
  ADD CONSTRAINT `SystemSetting_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `template`
--
ALTER TABLE `template`
  ADD CONSTRAINT `Template_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Template_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Template_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `User_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `whatsappaccount`
--
ALTER TABLE `whatsappaccount`
  ADD CONSTRAINT `WhatsAppAccount_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `whatsappsession`
--
ALTER TABLE `whatsappsession`
  ADD CONSTRAINT `WhatsAppSession_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `whatsappaccount` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `_rolepermissions`
--
ALTER TABLE `_rolepermissions`
  ADD CONSTRAINT `_RolePermissions_A_fkey` FOREIGN KEY (`A`) REFERENCES `permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `_RolePermissions_B_fkey` FOREIGN KEY (`B`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
