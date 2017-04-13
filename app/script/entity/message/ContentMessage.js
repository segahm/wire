/*
 * Wire
 * Copyright (C) 2017 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

'use strict';

window.z = window.z || {};
window.z.entity = z.entity || {};

z.entity.ContentMessage = class ContentMessage extends z.entity.Message {
  // Construct a new content message.
  constructor() {
    super();

    this.assets = ko.observableArray([]);
    this.nonce = null;
    this.super_type = z.message.SuperType.CONTENT;
    this.replacing_message_id = null;
    this.edited_timestamp = null;

    this.reactions = ko.observable({});
    this.reactions_user_ets = ko.observableArray();
    this.reactions_user_ids = ko.pureComputed(() => (this.reactions_user_ets().map(user_et => user_et.first_name())).join(', '));

    this.display_edited_timestamp = () => {
      return z.localization.Localizer.get_text({
        id: z.string.conversation_edit_timestamp,
        replace: {
          placeholder: '%@timestamp',
          content: moment(this.edited_timestamp).format('HH:mm')
        }
      });
    };

    // like
    this.is_liked_provisional = ko.observable();
    this.is_liked = ko.pureComputed({
      read: () => {
        if (this.is_liked_provisional() != null) {
          const is_liked_provisional = this.is_liked_provisional();
          this.is_liked_provisional(null);
          return is_liked_provisional;
        }
        const likes = this.reactions_user_ets().filter(user_et => user_et.is_me);
        return likes.length === 1;
      },
      write: value => {
        return this.is_liked_provisional(value);
      }
    });
    this.other_likes = ko.pureComputed(() => {
      return this.reactions_user_ets().filter(user_et => !user_et.is_me);
    });
    this.show_likes = ko.observable(false);

    this.like_caption = ko.pureComputed(() => {
      if (this.reactions_user_ets().length <= 5) {
        return (this.reactions_user_ets().map(user_et => user_et.first_name())).join(', ');
      } else {
        return z.localization.Localizer.get_text({
          id: z.string.conversation_likes_caption,
          replace: {
            placeholder: '%@number',
            content: this.reactions_user_ets().length
          }
        });
      }
    });
  }

  /*
   Add another content asset to the message.

   @param asset_et [z.entity.Asset] New content asset
   */
  add_asset(asset_et) {
    return this.assets.push(asset_et);
  }

  /*
   Get the first asset attached to the message.

   @return [z.entity.Message] The first asset attached to the message
   */
  get_first_asset() {
    return this.assets()[0];
  }

  update_reactions(event_json) {
    const reactions = this.reactions();

    if (event_json.data.reaction) {
      reactions[event_json.from] = event_json.data.reaction;
    } else {
      delete reactions[event_json.from];
    }

    if (reactions !== this.reactions) {
      this.reactions(reactions);
      this.version = this.version + 1;
      return {reactions: this.reactions(), version: this.version};
    }
  }

  /*
   Check whether the message was edited.

   @return [Boolean]
   */
  was_edited() {
    return (this.replacing_message_id != null);
  }

  /*
   Download message content.
   */
  download() {
    const asset_et = this.get_first_asset();
    const file_name = this.get_content_name();
    return asset_et.download(file_name);
  }

  /*
   Get content name.

   @return [Boolean]
   */
  get_content_name() {
    const asset_et = this.get_first_asset();
    let {file_name} = asset_et;

    if (!file_name) {
      const date = moment(this.timestamp());
      file_name = `Wire ${date.format('YYYY-MM-DD')} at ${date.format('H.mm.ss')}`;
    }

    if (asset_et.file_type) {
      const file_extension = asset_et.file_type.split('/').pop();
      file_name = `${file_name}.${file_extension}`;
    }

    return file_name;
  }
};