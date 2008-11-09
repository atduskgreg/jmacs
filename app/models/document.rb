class Document
  include InitFromPath
  
  attr_accessor :path, :pwd
  
  def file_handle
    @file_handle ||= File.open(path)
  end
  
  def content
    @content ||=  file_handle.read
  end
  
  def content= c
    @content = c
  end
  
  def to_json
    {:path => @path, :modified => file_handle.mtime, :content => content}.to_json
  end
  
  def save
    File.open(@path, "w"){|f| f << content }
  end
  
  def destroy
    File.delete(@path)
  end
end
