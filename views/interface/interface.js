GL={usercrypto:{user_keys:args.user_keys,nonce:args.nonce}};GL.cur_step=next_step();$.ajax({url:path+zchan(GL.usercrypto,GL.cur_step,"l/asset/modes"),success:function(object){object=zchan_obj(GL.usercrypto,GL.cur_step,object);GL.assetmodes=object.data;GL.cur_step=next_step();$.ajax({url:path+zchan(GL.usercrypto,GL.cur_step,"l/asset/names"),success:function(object){object=zchan_obj(GL.usercrypto,GL.cur_step,object);GL.assetnames=object.data;fetchview("interface.dashboard",args)}})}});
