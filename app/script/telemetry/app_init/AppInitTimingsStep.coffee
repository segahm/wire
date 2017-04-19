#
# Wire
# Copyright (C) 2016 Wire Swiss GmbH
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see http://www.gnu.org/licenses/.
#

window.z ?= {}
z.telemetry ?= {}
z.telemetry.app_init ?= {}

z.telemetry.app_init.AppInitTimingsStep =
  RESOURCES_WAIT: 'resources_wait'
  RESOURCES_FAIL: 'resources_fail'
  RECEIVED_ACCESS_TOKEN: 'received_access_token'
  INITIALIZED_PROTO_MESSAGES: 'initialized_proto_messages'
  RECEIVED_SELF_USER: 'received_self_user'
  INITIALIZED_STORAGE: 'initialized_storage'
  INITIALIZED_CRYPTOGRAPHY: 'initialized_cryptography'
  VALIDATED_CLIENT: 'validated_client'
  RECEIVED_USER_DATA: 'received_user_data'
  UPDATED_FROM_NOTIFICATIONS: 'updated_from_notifications'
  APP_PRE_LOADED: 'app_pre_loaded'
  SHOWING_UI: 'showing_ui'
  APP_LOADED: 'app_loaded'
  UPDATED_CONVERSATIONS: 'updated_conversations'
